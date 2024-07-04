import {DataInterface} from "~/interfaces/data.interface";
import {AccountingImpact, RulesInterface, TPMethod} from "~/interfaces/rules.interface";
import {BigNumber} from "mathjs";
import * as math from "mathjs";
import {CurrencyChange, MoneyType} from "@algonomia/framework";

export function computeTPA(data: DataInterface, rule: RulesInterface, target: number): MoneyType|undefined {
    switch (rule.atp_tp_method) {
        case TPMethod["TNMM ROA"]:
            return _computeTPAROA(data, target);
        case TPMethod["TNMM ROCE"]:
            return _computeTPAROCE(data, target);
        case TPMethod["TNMM ROS"]:
            return _computeTPAROS(data, rule, target);
        case TPMethod["TNMM ROOGS"]:
            return _computeTPAROOGS(data, target);
        case TPMethod["TNMM ROCOGS"]:
            return _computeTPAROCOGS(data, target);
        case TPMethod["TNMM ROOE"]:
            return _computeTPAROOE(data, target);
        case TPMethod["TNMM ROC"]:
            return _computeTPAROC(data, rule, target);
        case TPMethod.Royalty:
            return _computeTPARoyalty(data, target);
    }
}

function _computeTPAROA(data: DataInterface, target: number): MoneyType {
    const homogenizeMoney = CurrencyChange.getDefaultCurrencyChange().homogenizeMoney(data.local_currency, {profit_indicator: data.atp_profit_indicator, assets: data.atp_assets});
    return new MoneyType(
        <BigNumber>math.subtract(
            math.multiply(math.bignumber(target), homogenizeMoney.convertedMoney.assets.amount),
            homogenizeMoney.convertedMoney.profit_indicator.amount
        ),
        homogenizeMoney.sharedCurrency
    );
}

function _computeTPAROCE(data: DataInterface, target: number): MoneyType {
    const homogenizeMoney = CurrencyChange.getDefaultCurrencyChange().homogenizeMoney(data.local_currency, {profit_indicator: data.atp_profit_indicator, capital_employed: data.atp_capital_employed});
    return new MoneyType(
        <BigNumber>math.subtract(
            math.multiply(math.bignumber(target), homogenizeMoney.convertedMoney.capital_employed.amount),
            homogenizeMoney.convertedMoney.profit_indicator.amount
        ),
        homogenizeMoney.sharedCurrency
    );
}

function _computeTPAROOGS(data: DataInterface, target: number): MoneyType {
    const homogenizeMoney = CurrencyChange.getDefaultCurrencyChange().homogenizeMoney(data.local_currency, {profit_indicator: data.atp_profit_indicator, og_sales: data.atp_og_sales});
    return new MoneyType(
        <BigNumber>math.subtract(
            math.multiply(math.bignumber(target), homogenizeMoney.convertedMoney.og_sales.amount),
            homogenizeMoney.convertedMoney.profit_indicator.amount
        ),
        homogenizeMoney.sharedCurrency
    );
}

function _computeTPAROCOGS(data: DataInterface, target: number): MoneyType {
    const homogenizeMoney = CurrencyChange.getDefaultCurrencyChange().homogenizeMoney(data.local_currency, {profit_indicator: data.atp_profit_indicator, cogs: data.atp_cogs});
    return new MoneyType(
        <BigNumber>math.subtract(
            math.multiply(math.bignumber(target), homogenizeMoney.convertedMoney.cogs.amount),
            homogenizeMoney.convertedMoney.profit_indicator.amount
        ),
        homogenizeMoney.sharedCurrency
    );
}

function _computeTPAROS(data: DataInterface, rule: RulesInterface, target: number): MoneyType {
    const homogenizeMoney = CurrencyChange.getDefaultCurrencyChange().homogenizeMoney(data.local_currency, {profit_indicator: data.atp_profit_indicator, before_sales: data.atp_before_sales});
    if (rule.atp_accounting_impact_for_declaring === AccountingImpact.Sales) {
        return new MoneyType(
            <BigNumber>math.divide(
                math.subtract(
                    math.multiply(math.bignumber(target), homogenizeMoney.convertedMoney.before_sales.amount),
                    homogenizeMoney.convertedMoney.profit_indicator.amount
                ),
                math.subtract(1, math.bignumber(target))
            ),
            homogenizeMoney.sharedCurrency
        );
    } else {
        return new MoneyType(
            <BigNumber>math.subtract(
                math.multiply(math.bignumber(target), homogenizeMoney.convertedMoney.before_sales.amount),
                homogenizeMoney.convertedMoney.profit_indicator.amount
            ),
            homogenizeMoney.sharedCurrency
        );
    }
}

function _computeTPAROOE(data: DataInterface, target: number): MoneyType {
    const homogenizeMoney = CurrencyChange.getDefaultCurrencyChange().homogenizeMoney(data.local_currency, {profit_indicator: data.atp_profit_indicator, operating_expenses: data.atp_operating_expenses});
    return new MoneyType(
        <BigNumber>math.subtract(
            math.multiply(math.bignumber(target), homogenizeMoney.convertedMoney.operating_expenses.amount),
            homogenizeMoney.convertedMoney.profit_indicator.amount
        ),
        homogenizeMoney.sharedCurrency
    );
}

function _computeTPAROC(data: DataInterface, rule: RulesInterface, target: number): MoneyType {
    const homogenizeMoney = CurrencyChange.getDefaultCurrencyChange().homogenizeMoney(data.local_currency, {profit_indicator: data.atp_profit_indicator, before_sales: data.atp_before_sales});
    if (rule.atp_accounting_impact_for_declaring !== AccountingImpact.Sales) {
        return new MoneyType(
            <BigNumber><unknown>math.subtract(
                math.multiply(math.bignumber(target), homogenizeMoney.convertedMoney.before_sales.amount),
                math.multiply(homogenizeMoney.convertedMoney.profit_indicator.amount, math.add(1, math.bignumber(target)))
            ),
            homogenizeMoney.sharedCurrency
        );
    } else {
        return new MoneyType(
            <BigNumber>math.subtract(
                math.multiply(
                    math.divide(
                        math.bignumber(target),
                        math.add(1, math.bignumber(target))
                    ),
                    homogenizeMoney.convertedMoney.before_sales.amount
                ),
                homogenizeMoney.convertedMoney.profit_indicator.amount
            ),
            homogenizeMoney.sharedCurrency
        );
    }
}

function _computeTPARoyalty(data: DataInterface, target: number): MoneyType {
    const homogenizeMoney = CurrencyChange.getDefaultCurrencyChange().homogenizeMoney(data.local_currency, {base_royalty: data.atp_base_royalty, royalty_paid: data.atp_royalty_paid});
    return new MoneyType(
        <BigNumber>math.subtract(
            homogenizeMoney.convertedMoney.royalty_paid.invert().amount,
            math.multiply(math.bignumber(target), homogenizeMoney.convertedMoney.base_royalty.amount)
        ),
        homogenizeMoney.sharedCurrency
    );
}
