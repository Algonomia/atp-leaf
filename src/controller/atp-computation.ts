import {DataInterface, DataOutputInterface, DataOutputWHTInterface} from "~/interfaces/data.interface";
import {RuleApplicationModulation, RulesInterface} from "~/interfaces/rules.interface";
import {getCounterpart} from "~/controller/rules-affectation";
import * as math from "mathjs";
import {BigNumber} from "mathjs";
import {
    maxIterationsMultiplier,
    percentDecreaseThreshold,
    percentNumberOfIterations,
    sumTPAThreshold
} from "~/global";
import {kpiComputation} from "~/controller/atp-kpi-computation";
import {computeTPA} from "~/controller/atp-tpa-computation";
import {updateValues} from "~/controller/atp-update-values";
import {updateWHT} from "~/controller/atp-update-wht";
import {AtpFiscalComputation} from "~/controller/atp-fiscal-computation";
import {CurrencyChange, MoneyType} from "@algonomia/framework";

export class AtpComputation {

    private readonly _atpComputations: DataOutputInterface[];

    constructor(dataWithRule: [DataInterface, RulesInterface|undefined][]) {
        this._atpComputations = this._atpComputation(dataWithRule);
    }

    public getAtpComputations(): DataOutputInterface[] {
        return this._atpComputations;
    }

    private _atpComputation(dataWithRule: [DataInterface, RulesInterface|undefined][]): DataOutputWHTInterface[] {
        const dataOutputWithRule: [DataOutputWHTInterface, RulesInterface|undefined][] =
            dataWithRule.map(([data, rule]) => {
                const dataOutput = <DataOutputWHTInterface>Object.assign({
                    atp_sales: data.atp_before_sales?.copy(),
                    atp_pbt: data.atp_before_pbt?.copy(),
                    atp_tax_expenses: data.atp_before_tax_expenses?.copy()
                }, data);
                return [dataOutput, rule];
            });
        const dataWithRuleAndCounterpart: [DataOutputWHTInterface, RulesInterface, DataOutputWHTInterface|undefined][] =
            dataOutputWithRule.filter(([_, rule]) => rule !== undefined)
                .map(([data, rule]) => {
                    return [
                        data,
                        <RulesInterface>rule,
                        getCounterpart(dataOutputWithRule.map(dataWRule => dataWRule[0]), <RulesInterface>rule)
                    ];
                });
        let remainingIterations = dataWithRule.length * maxIterationsMultiplier;
        let sumTpa = this._iterateComputation(dataWithRuleAndCounterpart), previousSumTpa = Infinity;
        const decreaseThreshold = Math.ceil(percentDecreaseThreshold * dataWithRule.length / 100);
        let decreaseRemaining = decreaseThreshold;
        while (remainingIterations > 0 && sumTpa > sumTPAThreshold) {
            if (sumTpa < previousSumTpa) {
                decreaseRemaining--
            } else {
                if (decreaseRemaining < 1) {
                    remainingIterations = Math.min(remainingIterations, Math.ceil(percentNumberOfIterations * dataWithRule.length / 100))
                } else {
                    decreaseRemaining = decreaseThreshold;
                }
            }
            previousSumTpa = sumTpa;
            remainingIterations--;
            sumTpa = this._iterateComputation(dataWithRuleAndCounterpart);
        }
        this._applyTax(dataWithRuleAndCounterpart.map(dWRC => ({dataOutput: dWRC[0], rule: dWRC[1]})));
        return dataWithRuleAndCounterpart.map(d => d[2] ? [d[0], d[2]] : d[0]).flat();
    }

    private _iterateComputation(dataWithRule: [DataOutputWHTInterface, RulesInterface, DataOutputWHTInterface|undefined][]): number {
        return dataWithRule.map(([data, rule, counterpart]) => {
            const {kpi, target, actual_rule_application_modulation} = this._getKPIAndTarget(data, rule);
            if (data !== counterpart && kpi !== undefined) {
                let tpa: MoneyType|undefined = undefined;
                if (target) {
                    tpa = computeTPA(data, rule, target);
                }
                updateValues(data, counterpart, tpa, kpi, actual_rule_application_modulation, rule);
                updateWHT(data, counterpart, tpa, rule);
                return tpa?.amount;
            }
        }).reduce((a, b) => Math.abs(a ?? 0) + Math.abs(b ? math.number(b) : 0), 0) ?? 0;
    }

    private _getKPIAndTarget(data: DataInterface, rule: RulesInterface): {kpi?: BigNumber, target?: number, actual_rule_application_modulation?: RuleApplicationModulation} {
        const kpi = kpiComputation(data, rule);
        let target: number | undefined = undefined;
        let actual_rule_application_modulation: RuleApplicationModulation | undefined = undefined;
        if (kpi !== undefined) {
            const numKPI = math.number(kpi);
            if (numKPI < (rule.atp_benchmark_first_quartil ?? 0)) {
                if (rule.atp_rule_application_modulation?.includes(RuleApplicationModulation['Apply if inferior'])) {
                    target = rule.atp_benchmark_target_below;
                }
                actual_rule_application_modulation = RuleApplicationModulation['Apply if inferior'];
            } else if (numKPI > (rule.atp_benchmark_third_quartil ?? 0)) {
                if (rule.atp_rule_application_modulation?.includes(RuleApplicationModulation['Apply if superior'])) {
                    target = rule.atp_benchmark_target_above;
                }
                actual_rule_application_modulation = RuleApplicationModulation['Apply if superior'];
            } else {
                if (rule.atp_rule_application_modulation?.includes(RuleApplicationModulation['Apply if inside'])) {
                    target = rule.atp_benchmark_target_in;
                }
                actual_rule_application_modulation = RuleApplicationModulation['Apply if inside'];
            }
        }
        return {kpi, target, actual_rule_application_modulation};
    }

    private _applyTax(dataOutputWithRule: {dataOutput: DataOutputWHTInterface, rule?: RulesInterface}[]): void {
        const atpFiscalComputations = new AtpFiscalComputation(dataOutputWithRule).getATPFiscalComputations();
        atpFiscalComputations.forEach(dataTaxPayer => {
            dataTaxPayer.from_data_output.forEach(dataOutput => {
                const homogenizeMoney = CurrencyChange.getDefaultCurrencyChange().homogenizeMoney(dataOutput.local_currency, {
                    delta_pbt_tp: dataTaxPayer.atp_delta_pbt,
                    delta_pbt_tp_wht_paid: dataTaxPayer.delta_pbt_wht_royalty_paid,
                    delta_pbt_tp_wht_received: dataTaxPayer.delta_pbt_wht_royalty_received,
                    delta_pbt: dataOutput.atp_tpa_adj_amount,
                    delta_pbt_wht_paid: dataOutput.delta_pbt_wht_royalty_paid,
                    delta_pbt_wht_received: dataOutput.delta_pbt_wht_royalty_received,
                });
                const keyDeltaPBT = <BigNumber><unknown>math.divide(
                    math.add(
                        homogenizeMoney.convertedMoney.delta_pbt.amount,
                        math.add(
                            homogenizeMoney.convertedMoney.delta_pbt_wht_paid.amount,
                            homogenizeMoney.convertedMoney.delta_pbt_wht_received.amount
                        )
                    ),
                    math.add(
                        homogenizeMoney.convertedMoney.delta_pbt_tp.amount,
                        math.add(
                            homogenizeMoney.convertedMoney.delta_pbt_tp_wht_paid.amount,
                            homogenizeMoney.convertedMoney.delta_pbt_tp_wht_received.amount
                        )
                    )
                );
                dataOutput.atp_pbt = dataOutput.atp_pbt?.add([dataOutput.atp_tpa_adj_amount, dataOutput.delta_pbt_wht_royalty_paid, dataOutput.delta_pbt_wht_royalty_received]) ?? dataOutput.atp_tpa_adj_amount?.add([dataOutput.delta_pbt_wht_royalty_paid, dataOutput.delta_pbt_wht_royalty_received]);
                dataOutput.atp_tax_expenses = dataOutput.atp_tax_expenses?.add([dataTaxPayer.atp_delta_tax?.weight(keyDeltaPBT)]) ?? dataTaxPayer.atp_delta_tax?.weight(keyDeltaPBT);
                dataOutput.atp_tax_losses_carryforward_n = dataOutput.atp_tax_losses_carryforward_n?.subtract([dataTaxPayer.atp_new_tlcf_n?.weight(keyDeltaPBT)]) ?? dataTaxPayer.atp_new_tlcf_n?.weight(keyDeltaPBT).invert();
                dataOutput.atp_taxes_losses_generated_consumed = dataTaxPayer.atp_taxes_losses_generated_consumed?.weight(keyDeltaPBT);
                dataOutput.atp_wht_paid = dataOutput.delta_wht_royalty_paid;
            });
        });
    }

}
