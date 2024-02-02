import {
    DataOutputWHTInterface,
    DataTaxPayerInterface,
} from "~/interfaces/data.interface";
import * as math from "mathjs";
import {BigNumber} from "mathjs";
import {RulesInterface} from "~/interfaces/rules.interface";
import {CurrencyChange, MoneyType} from "@algonomia/framework";

export class AtpFiscalComputation {

    private readonly _atpFiscalComputations: DataTaxPayerInterface[];

    constructor(dataOutputWithRule: {dataOutput: DataOutputWHTInterface, rule?: RulesInterface}[]) {
        this._atpFiscalComputations = this._aggregatesByTaxPayer(dataOutputWithRule);
        this._atpFiscalComputations.forEach(dataTaxPayer => {
            this._setTLCFConsumedInit(dataTaxPayer);
            this._setUnexplainedConsumedTLCF(dataTaxPayer);
            this._setTLCFCreatedInit(dataTaxPayer);
            this._setUnexplainedCreatedTLCF(dataTaxPayer);
            this._setTLCFCreatedNew(dataTaxPayer);
            this._setTLCFConsumedNew(dataTaxPayer);
            this._setNewTLCFN(dataTaxPayer);
            this._setDeltaTaxInit(dataTaxPayer);
            this._setMeanTaxRate(dataTaxPayer);
            this._setDeltaTaxBis(dataTaxPayer);
            this._setConsummableTaxCredit(dataTaxPayer);
            this._setTaxFinal(dataTaxPayer);
            this._setFiscalOutput(dataTaxPayer);
        });
    }

    public getATPFiscalComputations(): DataTaxPayerInterface[] {
        return this._atpFiscalComputations;
    }

    private _aggregatesByTaxPayer(dataOutputWithRule: {dataOutput: DataOutputWHTInterface, rule?: RulesInterface}[]): DataTaxPayerInterface[] {
        const dataTaxPayers: DataTaxPayerInterface[] = [];
        const taxPayerDataOutputMap = new Map<string, {dataOutput: DataOutputWHTInterface, rule?: RulesInterface}[]>;
        dataOutputWithRule.forEach(data => {
            if (data.dataOutput.atp_taxpayer) {
                if (!taxPayerDataOutputMap.has(data.dataOutput.atp_taxpayer)) {
                    taxPayerDataOutputMap.set(data.dataOutput.atp_taxpayer, []);
                }
                taxPayerDataOutputMap.get(data.dataOutput.atp_taxpayer)?.push(data);
            }
        });
        taxPayerDataOutputMap.forEach((data, taxPayer) => {
            const dataTaxPayer: DataTaxPayerInterface = {atp_taxpayer: taxPayer, from_data_output: []};
            const usePBT = data.some(datum => datum.dataOutput.atp_before_pbt !== undefined);
            data.forEach(datum => {
                dataTaxPayer.atp_pbt = dataTaxPayer.atp_pbt?.add([usePBT ? datum.dataOutput.atp_before_pbt : datum.dataOutput.atp_profit_indicator], {targetCurrency: datum.dataOutput.local_currency}) ?? (usePBT ? datum.dataOutput.atp_before_pbt : datum.dataOutput.atp_profit_indicator);
                dataTaxPayer.atp_delta_pbt = dataTaxPayer.atp_delta_pbt?.add([datum.dataOutput.atp_tpa_adj_amount], {targetCurrency: datum.dataOutput.local_currency}) ?? datum.dataOutput.atp_tpa_adj_amount;
                dataTaxPayer.atp_tax_expenses = dataTaxPayer.atp_tax_expenses?.add([datum.dataOutput.atp_tax_expenses], {targetCurrency: datum.dataOutput.local_currency}) ?? datum.dataOutput.atp_tax_expenses;
                dataTaxPayer.atp_tax_losses_carryforward_n = dataTaxPayer.atp_tax_losses_carryforward_n?.add([datum.dataOutput.atp_tax_losses_carryforward_n], {targetCurrency: datum.dataOutput.local_currency}) ?? datum.dataOutput.atp_tax_losses_carryforward_n;
                dataTaxPayer.atp_tax_losses_carryforward_n1 = dataTaxPayer.atp_tax_losses_carryforward_n1?.add([datum.dataOutput.atp_tax_losses_carryforward_n1], {targetCurrency: datum.dataOutput.local_currency}) ?? datum.dataOutput.atp_tax_losses_carryforward_n1;
                dataTaxPayer.delta_wht_royalty_received = dataTaxPayer.delta_wht_royalty_received?.add([datum.dataOutput.delta_wht_royalty_received], {targetCurrency: datum.dataOutput.local_currency}) ?? datum.dataOutput.delta_wht_royalty_received;
                dataTaxPayer.delta_pbt_wht_royalty_received = dataTaxPayer.delta_pbt_wht_royalty_received?.add([datum.dataOutput.delta_pbt_wht_royalty_received], {targetCurrency: datum.dataOutput.local_currency}) ?? datum.dataOutput.delta_pbt_wht_royalty_received;
                dataTaxPayer.delta_pbt_wht_royalty_paid = dataTaxPayer.delta_pbt_wht_royalty_paid?.add([datum.dataOutput.delta_pbt_wht_royalty_paid], {targetCurrency: datum.dataOutput.local_currency}) ?? datum.dataOutput.delta_pbt_wht_royalty_paid;
                dataTaxPayer.possible_wht_royalty_tax_credits = dataTaxPayer.possible_wht_royalty_tax_credits?.add([datum.dataOutput.possible_wht_royalty_tax_credits], {targetCurrency: datum.dataOutput.local_currency}) ?? datum.dataOutput.possible_wht_royalty_tax_credits;
                dataTaxPayer.delta_tax_wht_royalty_received = dataTaxPayer.delta_tax_wht_royalty_received?.add([datum.dataOutput.delta_tax_wht_royalty_received], {targetCurrency: datum.dataOutput.local_currency}) ?? datum.dataOutput.delta_tax_wht_royalty_received;
                dataTaxPayer.atp_royalty_received = dataTaxPayer.atp_royalty_received?.add([datum.dataOutput.atp_royalty_received], {targetCurrency: datum.dataOutput.local_currency}) ?? datum.dataOutput.atp_royalty_received;
                dataTaxPayer.atp_royalty_received_prod_specific_rate = dataTaxPayer.atp_royalty_received_prod_specific_rate?.add([datum.dataOutput.atp_royalty_received_prod_specific_rate], {targetCurrency: datum.dataOutput.local_currency}) ?? datum.dataOutput.atp_royalty_received_prod_specific_rate;
                dataTaxPayer.rule_atp_tax_losses_carryforward_depreciation = datum.rule?.atp_tax_losses_carryforward_depreciation; // TODO : test if unique
                dataTaxPayer.rule_atp_tax_loss_carryforward_ceiling_for_use = datum.rule?.atp_tax_loss_carryforward_ceiling_for_use; // TODO : test if unique
                dataTaxPayer.rule_atp_share_of_tax_losses_carryfoward = datum.rule?.atp_share_of_tax_losses_carryfoward; // TODO : test if unique
                dataTaxPayer.rule_atp_tax_rate = datum.rule?.atp_tax_rate; // TODO : test if unique
                dataTaxPayer.from_data_output.push(datum.dataOutput);
            });
            dataTaxPayers.push(dataTaxPayer);
        });
        return dataTaxPayers;
    }

    private _setTLCFConsumedInit(data: DataTaxPayerInterface) {
        const homogenizeMoney = CurrencyChange.getDefaultCurrencyChange().homogenizeMoney(undefined,
            {tlcfn1: data.atp_tax_losses_carryforward_n1, tlcfn: data.atp_tax_losses_carryforward_n});
        data.atp_tlcf_consumed_init = new MoneyType(
            math.max(math.bignumber(0), math.subtract(
                <BigNumber><unknown>math.multiply(homogenizeMoney.convertedMoney.tlcfn1.amount, math.subtract(1, math.bignumber(data.rule_atp_tax_losses_carryforward_depreciation ?? 0))),
                homogenizeMoney.convertedMoney.tlcfn.amount)),
            homogenizeMoney.sharedCurrency
        );
    }

    private _setUnexplainedConsumedTLCF(data: DataTaxPayerInterface) {
        const homogenizeMoney = CurrencyChange.getDefaultCurrencyChange().homogenizeMoney(undefined, {
            tlcf_consumed_init: data.atp_tlcf_consumed_init,
            tlcfn1: data.atp_tax_losses_carryforward_n1,
            tlcf_ceiling: data.rule_atp_tax_loss_carryforward_ceiling_for_use,
            atp_pbt: data.atp_pbt
        });
        data.atp_unexplained_consumed_tlcf = new MoneyType(
            math.subtract(
                homogenizeMoney.convertedMoney.tlcf_consumed_init.amount,
                <BigNumber>math.min(
                    <BigNumber><unknown>math.multiply(
                        homogenizeMoney.convertedMoney.tlcfn1.amount,
                        math.subtract(1, math.bignumber(data.rule_atp_tax_losses_carryforward_depreciation ?? 0))
                    ),
                    math.add(
                        math.max(0, math.min(homogenizeMoney.convertedMoney.tlcf_ceiling.amount, homogenizeMoney.convertedMoney.atp_pbt.amount)),
                        <BigNumber><unknown>math.multiply(
                            math.bignumber(data.rule_atp_share_of_tax_losses_carryfoward ?? 0),
                            math.max(0, math.subtract(homogenizeMoney.convertedMoney.atp_pbt.amount, homogenizeMoney.convertedMoney.tlcf_ceiling.amount))
                        )
                    )
                )
            ),
            homogenizeMoney.sharedCurrency
        );
    }

    private _setTLCFCreatedInit(data: DataTaxPayerInterface) {
        const homogenizeMoney = CurrencyChange.getDefaultCurrencyChange().homogenizeMoney(undefined,
            {tlcfn1: data.atp_tax_losses_carryforward_n1, tlcfn: data.atp_tax_losses_carryforward_n});
        data.atp_tlcf_created_init = new MoneyType(
            <BigNumber><unknown>math.multiply(
                math.bignumber(-1),
                math.min(
                    math.bignumber(0),
                    math.subtract(
                        <BigNumber><unknown>math.multiply(
                            homogenizeMoney.convertedMoney.tlcfn1.amount,
                            math.subtract(math.bignumber(1), math.bignumber(data.rule_atp_tax_losses_carryforward_depreciation ?? 0))
                        ),
                        homogenizeMoney.convertedMoney.tlcfn.amount
                    )
                )
            ),
            homogenizeMoney.sharedCurrency
        );
    }

    private _setUnexplainedCreatedTLCF(data: DataTaxPayerInterface) {
        const homogenizeMoney = CurrencyChange.getDefaultCurrencyChange().homogenizeMoney(undefined,
            {tlcf_created_init: data.atp_tlcf_created_init, atp_pbt: data.atp_pbt});
        data.atp_unexplained_created_tlcf = new MoneyType(
            math.add(
                homogenizeMoney.convertedMoney.tlcf_created_init.amount,
                <BigNumber>math.min(0, homogenizeMoney.convertedMoney.atp_pbt.amount)
            ),
            homogenizeMoney.sharedCurrency
        );
    }

    private _setTLCFCreatedNew(data: DataTaxPayerInterface) {
        const homogenizeMoney = CurrencyChange.getDefaultCurrencyChange().homogenizeMoney(undefined, {
            atp_delta_pbt: data.atp_delta_pbt,
            atp_pbt: data.atp_pbt,
            delta_pbt_wht_royalty_paid: data.delta_pbt_wht_royalty_paid,
            delta_pbt_wht_royalty_received: data.delta_pbt_wht_royalty_received,
            atp_unexplained_created_tlcf: data.atp_unexplained_created_tlcf
        });
        data.atp_tlcf_created_new = new MoneyType(
            math.max(
                math.bignumber(0),
                <BigNumber><unknown>math.multiply(
                    -1,
                    math.min(
                        0,
                        math.add(
                            homogenizeMoney.convertedMoney.atp_pbt.amount,
                            math.add(
                                homogenizeMoney.convertedMoney.atp_delta_pbt.amount,
                                math.add(
                                    homogenizeMoney.convertedMoney.delta_pbt_wht_royalty_paid.amount,
                                    math.add(
                                        homogenizeMoney.convertedMoney.delta_pbt_wht_royalty_received.amount,
                                        homogenizeMoney.convertedMoney.atp_unexplained_created_tlcf.amount
                                    )
                                )
                            )
                        )
                    )
                )
            ),
            homogenizeMoney.sharedCurrency
        );
    }

    private _setTLCFConsumedNew(data: DataTaxPayerInterface) {
        const homogenizeMoney = CurrencyChange.getDefaultCurrencyChange().homogenizeMoney(undefined, {
            tlcfn1: data.atp_tax_losses_carryforward_n1,
            atp_delta_pbt: data.atp_delta_pbt,
            atp_pbt: data.atp_pbt,
            delta_pbt_wht_royalty_paid: data.delta_pbt_wht_royalty_paid,
            delta_pbt_wht_royalty_received: data.delta_pbt_wht_royalty_received,
            atp_unexplained_consumed_tlcf: data.atp_unexplained_consumed_tlcf,
            rule_atp_tax_loss_carryforward_ceiling_for_use: data.rule_atp_tax_loss_carryforward_ceiling_for_use
        });
        data.atp_tlcf_consumed_new = new MoneyType(
            <BigNumber>math.max(
                0,
                math.min(
                    <BigNumber><unknown>math.multiply(
                        homogenizeMoney.convertedMoney.tlcfn1.amount,
                        math.subtract(math.bignumber(1), math.bignumber(data.rule_atp_tax_losses_carryforward_depreciation ?? 0))
                    ),
                    math.add(
                        <BigNumber>math.min(
                            homogenizeMoney.convertedMoney.rule_atp_tax_loss_carryforward_ceiling_for_use.amount,
                            math.add(
                                homogenizeMoney.convertedMoney.atp_pbt.amount,
                                math.add(
                                    homogenizeMoney.convertedMoney.atp_delta_pbt.amount,
                                    math.add(
                                        homogenizeMoney.convertedMoney.delta_pbt_wht_royalty_paid.amount,
                                        homogenizeMoney.convertedMoney.delta_pbt_wht_royalty_received.amount
                                    )
                                )
                            )
                        ),
                        math.add(
                            <BigNumber><unknown>math.multiply(
                                math.bignumber(data.rule_atp_share_of_tax_losses_carryfoward ?? 0),
                                math.max(
                                    0,
                                    math.subtract(
                                        math.add(
                                            homogenizeMoney.convertedMoney.atp_pbt.amount,
                                            math.add(
                                                homogenizeMoney.convertedMoney.atp_delta_pbt.amount,
                                                math.add(
                                                    homogenizeMoney.convertedMoney.delta_pbt_wht_royalty_paid.amount,
                                                    homogenizeMoney.convertedMoney.delta_pbt_wht_royalty_received.amount
                                                )
                                            )
                                        ),
                                        homogenizeMoney.convertedMoney.rule_atp_tax_loss_carryforward_ceiling_for_use.amount
                                    )
                                )
                            ),
                            homogenizeMoney.convertedMoney.atp_unexplained_consumed_tlcf.amount
                        )
                    )
                )
            ),
            homogenizeMoney.sharedCurrency
        );
    }

    private _setNewTLCFN(data: DataTaxPayerInterface) {
        const homogenizeMoney = CurrencyChange.getDefaultCurrencyChange().homogenizeMoney(undefined, {
            tlcfn1: data.atp_tax_losses_carryforward_n1,
            atp_tlcf_created_new: data.atp_tlcf_created_new,
            atp_tlcf_consumed_new: data.atp_tlcf_consumed_new
        });
        data.atp_new_tlcf_n = new MoneyType(
            math.add(
                <BigNumber><unknown>math.multiply(
                    homogenizeMoney.convertedMoney.tlcfn1.amount,
                    math.subtract(1, math.bignumber(data.rule_atp_tax_losses_carryforward_depreciation ?? 0))
                ),
                math.subtract(
                    homogenizeMoney.convertedMoney.atp_tlcf_created_new.amount,
                    homogenizeMoney.convertedMoney.atp_tlcf_consumed_new.amount
                )
            ),
            homogenizeMoney.sharedCurrency
        );
    }

    private _setDeltaTaxInit(data: DataTaxPayerInterface) {
        const homogenizeMoney = CurrencyChange.getDefaultCurrencyChange().homogenizeMoney(undefined, {
            atp_delta_pbt: data.atp_delta_pbt,
            atp_royalty_received: data.atp_royalty_received,
            delta_tax_wht_royalty_received: data.delta_tax_wht_royalty_received,
            atp_royalty_received_prod_specific_rate: data.atp_royalty_received_prod_specific_rate
        });
        data.atp_delta_tax_init = new MoneyType(
            math.subtract(
                <BigNumber><unknown>math.multiply(
                    homogenizeMoney.convertedMoney.atp_delta_pbt.amount,
                    math.bignumber(data.rule_atp_tax_rate ?? 0)
                ),
                math.add(
                    math.subtract(
                        math.prod(
                            homogenizeMoney.convertedMoney.atp_royalty_received.amount,
                            math.bignumber(data.rule_atp_tax_rate ?? 0)
                        ),
                        homogenizeMoney.convertedMoney.atp_royalty_received_prod_specific_rate.amount
                    ),
                    homogenizeMoney.convertedMoney.delta_tax_wht_royalty_received.amount
                )

            ),
            homogenizeMoney.sharedCurrency
        );
    }

    private _setMeanTaxRate(data: DataTaxPayerInterface) {
        const homogenizeMoney = CurrencyChange.getDefaultCurrencyChange().homogenizeMoney(undefined, {
            atp_delta_pbt: data.atp_delta_pbt,
            atp_delta_tax_init: data.atp_delta_tax_init
        });
        data.atp_mean_tax_rate = new MoneyType(
            <BigNumber><unknown>math.divide(
                homogenizeMoney.convertedMoney.atp_delta_tax_init.amount,
                homogenizeMoney.convertedMoney.atp_delta_pbt.amount
            ),
            homogenizeMoney.sharedCurrency
        );
    }

    private _setDeltaTaxBis(data: DataTaxPayerInterface) {
        const homogenizeMoney = CurrencyChange.getDefaultCurrencyChange().homogenizeMoney(undefined, {
            atp_mean_tax_rate: data.atp_mean_tax_rate,
            atp_delta_tax_init: data.atp_delta_tax_init,
            atp_tlcf_consumed_new: data.atp_tlcf_consumed_new,
            atp_tlcf_consumed_init: data.atp_tlcf_consumed_init,
            atp_tlcf_created_new: data.atp_tlcf_created_new,
            atp_tlcf_created_init: data.atp_tlcf_created_init,
            atp_tax_expenses: data.atp_tax_expenses
        });
        data.atp_delta_tax_bis = new MoneyType(
            math.max(
                <BigNumber><unknown>math.multiply(
                    math.bignumber(-1),
                    math.max(
                        math.bignumber(0),
                        homogenizeMoney.convertedMoney.atp_tax_expenses.amount
                    )
                ),
                math.subtract(
                    homogenizeMoney.convertedMoney.atp_delta_tax_init.amount,
                    <BigNumber>math.multiply(
                        homogenizeMoney.convertedMoney.atp_mean_tax_rate.amount,
                        math.add(
                            homogenizeMoney.convertedMoney.atp_tlcf_consumed_new.amount,
                            math.subtract(
                                homogenizeMoney.convertedMoney.atp_tlcf_created_new.amount,
                                math.add(
                                    homogenizeMoney.convertedMoney.atp_tlcf_consumed_init.amount,
                                    homogenizeMoney.convertedMoney.atp_tlcf_created_init.amount
                                )
                            )
                        )
                    )
                )
            ),
            homogenizeMoney.sharedCurrency
        );
    }

    private _setConsummableTaxCredit(data: DataTaxPayerInterface) {
        const homogenizeMoney = CurrencyChange.getDefaultCurrencyChange().homogenizeMoney(undefined, {
            atp_tax_expenses: data.atp_tax_expenses,
            atp_delta_tax_bis: data.atp_delta_tax_bis,
            possible_wht_royalty_tax_credits: data.possible_wht_royalty_tax_credits
        });
        data.atp_consummable_tax_credit = new MoneyType(
            math.max(
                math.bignumber(0),
                math.min(
                    homogenizeMoney.convertedMoney.possible_wht_royalty_tax_credits.amount,
                    math.add(
                        homogenizeMoney.convertedMoney.atp_delta_tax_bis.amount,
                        homogenizeMoney.convertedMoney.atp_tax_expenses.amount,
                    )
                )
            ),
            homogenizeMoney.sharedCurrency
        );
    }

    private _setTaxFinal(data: DataTaxPayerInterface) {
        const homogenizeMoney = CurrencyChange.getDefaultCurrencyChange().homogenizeMoney(undefined, {
            atp_delta_tax_bis: data.atp_delta_tax_bis,
            atp_consummable_tax_credit: data.atp_consummable_tax_credit,
            delta_wht_royalty_received: data.delta_wht_royalty_received,
        });
        data.atp_delta_tax = new MoneyType(
            math.add(
                math.subtract(
                    homogenizeMoney.convertedMoney.atp_delta_tax_bis.amount,
                    homogenizeMoney.convertedMoney.atp_consummable_tax_credit.amount
                ),
                homogenizeMoney.convertedMoney.delta_wht_royalty_received.amount
            ),
            homogenizeMoney.sharedCurrency
        );
    }

    private _setFiscalOutput(data: DataTaxPayerInterface) {
        data.atp_pbt = data.atp_pbt?.add([data.atp_delta_pbt, data.delta_pbt_wht_royalty_received, data.delta_pbt_wht_royalty_paid]) ??
            data.atp_delta_pbt?.add([data.delta_pbt_wht_royalty_received, data.delta_pbt_wht_royalty_paid]) ??
            data.delta_pbt_wht_royalty_received?.add([data.delta_pbt_wht_royalty_paid]) ??
            data.delta_pbt_wht_royalty_paid;
        data.atp_new_tlcf_n = data.atp_tax_losses_carryforward_n?.subtract([data.atp_new_tlcf_n]) ?? data.atp_new_tlcf_n?.invert();
        data.atp_taxes_losses_generated_consumed = data.atp_tlcf_created_new?.subtract([data.atp_tlcf_consumed_new]);
        data.atp_wht_paid = data.delta_wht_royalty_received;
    }

}
