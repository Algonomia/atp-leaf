import {DataOutputInterface} from "~/interfaces/data.interface";
import {
    AccountingImpact,
    KPIName,
    RuleApplicationModulation,
    RulesInterface,
    TPMethod
} from "~/interfaces/rules.interface";
import * as math from "mathjs";
import {BigNumber} from "mathjs";
import {CurrencyChange, MoneyType} from "@algonomia/framework";

export function updateValues(data: DataOutputInterface, counterpart: DataOutputInterface|undefined, tpa: MoneyType|undefined,
                             kpi: BigNumber|undefined, actual_rule_application_modulation: RuleApplicationModulation|undefined, rule: RulesInterface) {
    if (kpi) {
        _updateKPI(data, rule, kpi);
    }
    if (actual_rule_application_modulation) {
        _updateActualModulation(data, actual_rule_application_modulation);
    }
    if (tpa !== undefined && !tpa.amount.equals(0)) {
        _updateTPA(data, counterpart, tpa);
        _updateProfitIndicator(data, counterpart, tpa);
        if (rule.atp_tp_method === TPMethod.Royalty) {
            _updateRoyalty(data, counterpart, rule, tpa);
        }
        _updateWithAccountingImpactDeclaring(data, rule, tpa);
        if (counterpart) {
            _updateWithAccountingImpactCounterpart(counterpart, rule, tpa);
        }
    }
}

function _updateActualModulation(data: DataOutputInterface, actual_rule_application_modulation: RuleApplicationModulation) {
    if (data.atp_actual_rule_application_modulation === undefined) {
        data.atp_actual_rule_application_modulation = actual_rule_application_modulation;
    }
}

function _updateKPI(data: DataOutputInterface, rule: RulesInterface, kpi: BigNumber) {
    if (data.atp_kpi_value === undefined) {
        data.atp_kpi_value = kpi.toNumber();
    }
    switch (rule.atp_tp_method) {
        case TPMethod['TNMM ROA'] :
            data.atp_kpi_from_rule = KPIName['Return on Asset']
            break;
        case TPMethod['TNMM ROCE'] :
            data.atp_kpi_from_rule = KPIName['Return on Capital Employed']
            break;
        case TPMethod['TNMM ROS'] :
            data.atp_kpi_from_rule = KPIName['Return on Sales']
            break;
        case TPMethod['TNMM ROOGS'] :
            data.atp_kpi_from_rule = KPIName['Return on Out of Group Sales']
            break;
        case TPMethod['TNMM ROCOGS'] :
            data.atp_kpi_from_rule = KPIName['Return on Costs of Goods Solds']
            break;
        case TPMethod['TNMM ROOE'] :
            data.atp_kpi_from_rule = KPIName['Return on Operating Expenses / Berry Ratio']
            break;
        case TPMethod['TNMM ROC'] :
            data.atp_kpi_from_rule = KPIName['Return on Costs']
            break;
        case TPMethod['Royalty'] :
            data.atp_kpi_from_rule = KPIName['Royalty rate']
            break;
    }
}

function _updateTPA(data: DataOutputInterface, counterpart: DataOutputInterface|undefined, tpa: MoneyType) {
    const homogenizeMoneyTPA = CurrencyChange.getDefaultCurrencyChange().homogenizeMoney(data.local_currency,{dataTPA: data.atp_tpa_adj_amount, tpa: tpa});
    data.atp_tpa_adj_amount = new MoneyType(
        math.add(homogenizeMoneyTPA.convertedMoney.dataTPA.amount, homogenizeMoneyTPA.convertedMoney.tpa.amount),
        homogenizeMoneyTPA.sharedCurrency
    );
    if (counterpart) {
        const homogenizeMoneyTPACounter = CurrencyChange.getDefaultCurrencyChange().homogenizeMoney(counterpart.local_currency,{counterTPA: counterpart.atp_tpa_adj_amount, tpa: tpa});
        counterpart.atp_tpa_adj_amount = new MoneyType(
            math.subtract(homogenizeMoneyTPACounter.convertedMoney.counterTPA.amount, homogenizeMoneyTPACounter.convertedMoney.tpa.amount),
            homogenizeMoneyTPACounter.sharedCurrency
        );
    }
}

function _updateProfitIndicator(data: DataOutputInterface, counterpart: DataOutputInterface|undefined, tpa: MoneyType) {
    const homogenizeMoneyIncomeTPA = CurrencyChange.getDefaultCurrencyChange().homogenizeMoney(data.local_currency,{profit_indicator: data.atp_profit_indicator, tpa: tpa});
    data.atp_profit_indicator = new MoneyType(
        math.add(homogenizeMoneyIncomeTPA.convertedMoney.profit_indicator.amount, homogenizeMoneyIncomeTPA.convertedMoney.tpa.amount),
        homogenizeMoneyIncomeTPA.sharedCurrency
    );
    if (counterpart) {
        const homogenizeMoneyCounterIncomeTPA = CurrencyChange.getDefaultCurrencyChange().homogenizeMoney(counterpart.local_currency,{profit_indicator: counterpart.atp_profit_indicator, tpa: tpa}, true);
        counterpart.atp_profit_indicator = new MoneyType(
            math.subtract(homogenizeMoneyCounterIncomeTPA.convertedMoney.profit_indicator.amount, homogenizeMoneyCounterIncomeTPA.convertedMoney.tpa.amount),
            homogenizeMoneyCounterIncomeTPA.sharedCurrency
        );
    }
}

function _updateRoyalty(data: DataOutputInterface, counterpart: DataOutputInterface|undefined, rule: RulesInterface, tpa: MoneyType) {
    const homogenizeMoneyRoyaltyPaidTPA = CurrencyChange.getDefaultCurrencyChange().homogenizeMoney(data.local_currency,{royalty_paid: data.atp_royalty_paid, tpa: tpa});
    data.atp_royalty_paid = new MoneyType(
        math.add(homogenizeMoneyRoyaltyPaidTPA.convertedMoney.royalty_paid.amount, homogenizeMoneyRoyaltyPaidTPA.convertedMoney.tpa.amount),
        homogenizeMoneyRoyaltyPaidTPA.sharedCurrency
    );
    if (counterpart) {
        const homogenizeMoneyCounterRoyaltyReceivedTPA = CurrencyChange.getDefaultCurrencyChange().homogenizeMoney(counterpart.local_currency,{royalty_received: counterpart.atp_royalty_received, tpa: tpa}, true);
        counterpart.atp_royalty_received = new MoneyType(
            math.subtract(homogenizeMoneyCounterRoyaltyReceivedTPA.convertedMoney.royalty_received.amount, homogenizeMoneyCounterRoyaltyReceivedTPA.convertedMoney.tpa.amount),
            homogenizeMoneyCounterRoyaltyReceivedTPA.sharedCurrency
        );
        const homogenizeMoneyCounterRoyaltyReceived = CurrencyChange.getDefaultCurrencyChange().homogenizeMoney(counterpart.local_currency,{
            atp_royalty_received_prod_specific_rate: counterpart.atp_royalty_received_prod_specific_rate,
            tpa: tpa
        });
        counterpart.atp_royalty_received_prod_specific_rate = new MoneyType(
            math.add(
                homogenizeMoneyCounterRoyaltyReceived.convertedMoney.atp_royalty_received_prod_specific_rate.amount,
                math.prod(
                    math.bignumber(-1),
                    homogenizeMoneyCounterRoyaltyReceived.convertedMoney.tpa.amount,
                    math.bignumber(rule.atp_royalties_specific_rate)
                )
            ),
            homogenizeMoneyCounterRoyaltyReceived.sharedCurrency
        );
    }
}

function _updateWithAccountingImpactDeclaring(data: DataOutputInterface, rule: RulesInterface, tpa: MoneyType) {
    if (rule.atp_accounting_impact_for_declaring === AccountingImpact.Sales) {
        const homogenizeMoneySalesTPA = CurrencyChange.getDefaultCurrencyChange().homogenizeMoney(data.local_currency,{sales: data.atp_sales, tpa: tpa});
        data.atp_sales = new MoneyType(
            math.add(homogenizeMoneySalesTPA.convertedMoney.sales.amount, homogenizeMoneySalesTPA.convertedMoney.tpa.amount),
            homogenizeMoneySalesTPA.sharedCurrency
        );
    } else if (rule.atp_accounting_impact_for_declaring === AccountingImpact.COGS) {
        const homogenizeMoneyCOGSTPA = CurrencyChange.getDefaultCurrencyChange().homogenizeMoney(data.local_currency,{cogs: data.atp_cogs, tpa: tpa});
        data.atp_cogs = new MoneyType(
            math.subtract(homogenizeMoneyCOGSTPA.convertedMoney.cogs.amount, homogenizeMoneyCOGSTPA.convertedMoney.tpa.amount),
            homogenizeMoneyCOGSTPA.sharedCurrency
        );
    } else if (rule.atp_accounting_impact_for_declaring === AccountingImpact["Operating expenses"]) {
        const homogenizeMoneyOperatingExpensesTPA = CurrencyChange.getDefaultCurrencyChange().homogenizeMoney(data.local_currency,{operating_expenses: data.atp_operating_expenses, tpa: tpa});
        data.atp_sales = new MoneyType(
            math.subtract(homogenizeMoneyOperatingExpensesTPA.convertedMoney.operating_expenses.amount, homogenizeMoneyOperatingExpensesTPA.convertedMoney.tpa.amount),
            homogenizeMoneyOperatingExpensesTPA.sharedCurrency
        );
    }
}

function _updateWithAccountingImpactCounterpart(counterpart: DataOutputInterface, rule: RulesInterface, tpa: MoneyType) {
    if (rule.atp_accounting_impact_for_counterpart === AccountingImpact.Sales) {
        const homogenizeMoneySalesTPA = CurrencyChange.getDefaultCurrencyChange().homogenizeMoney(counterpart.local_currency,{sales: counterpart.atp_sales, tpa: tpa});
        counterpart.atp_sales = new MoneyType(
            math.subtract(homogenizeMoneySalesTPA.convertedMoney.sales.amount, homogenizeMoneySalesTPA.convertedMoney.tpa.amount),
            homogenizeMoneySalesTPA.sharedCurrency
        );
    } else if (rule.atp_accounting_impact_for_counterpart === AccountingImpact.COGS) {
        const homogenizeMoneyCOGSTPA = CurrencyChange.getDefaultCurrencyChange().homogenizeMoney(counterpart.local_currency,{cogs: counterpart.atp_cogs, tpa: tpa});
        counterpart.atp_cogs = new MoneyType(
            math.add(homogenizeMoneyCOGSTPA.convertedMoney.cogs.amount, homogenizeMoneyCOGSTPA.convertedMoney.tpa.amount),
            homogenizeMoneyCOGSTPA.sharedCurrency
        );
    } else if (rule.atp_accounting_impact_for_counterpart === AccountingImpact["Operating expenses"]) {
        const homogenizeMoneyOperatingExpensesTPA = CurrencyChange.getDefaultCurrencyChange().homogenizeMoney(counterpart.local_currency,{operating_expenses: counterpart.atp_operating_expenses, tpa: tpa});
        counterpart.atp_sales = new MoneyType(
            math.add(homogenizeMoneyOperatingExpensesTPA.convertedMoney.operating_expenses.amount, homogenizeMoneyOperatingExpensesTPA.convertedMoney.tpa.amount),
            homogenizeMoneyOperatingExpensesTPA.sharedCurrency
        );
    }
}
