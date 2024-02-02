import {DataInterface} from "~/interfaces/data.interface";
import {RulesInterface, TPMethod} from "~/interfaces/rules.interface";
import {BigNumber} from "mathjs";
import * as math from "mathjs";
import {CurrencyChange} from "@algonomia/framework";

export function kpiComputation(data: DataInterface, rule: RulesInterface): BigNumber|undefined {
    switch (rule.atp_tp_method) {
        case TPMethod["TNMM ROA"]:
            return _getKPIROA(data);
        case TPMethod["TNMM ROCE"]:
            return _getKPIROCE(data);
        case TPMethod["TNMM ROS"]:
            return _getKPIROS(data);
        case TPMethod["TNMM ROOGS"]:
            return _getKPIROOGS(data);
        case TPMethod["TNMM ROCOGS"]:
            return _getKPIROCOGS(data);
        case TPMethod["TNMM ROOE"]:
            return _getKPIROOE(data);
        case TPMethod["TNMM ROC"]:
            return _getKPIROC(data);
        case TPMethod.Royalty:
            return _getKPIRoyalty(data);
    }
}

function _getKPIROA(data: DataInterface): BigNumber | undefined {
    const convertedMoney = CurrencyChange.getDefaultCurrencyChange().homogenizeMoney(data.local_currency, {profit_indicator: data.atp_profit_indicator, assets: data.atp_assets}).convertedMoney;
    if (convertedMoney.assets?.amount.equals(0)) {
        return undefined;
    }
    return <BigNumber><unknown>math.divide(convertedMoney.profit_indicator.amount, convertedMoney.sales.amount);
}

function _getKPIROCE(data: DataInterface): BigNumber | undefined {
    const convertedMoney = CurrencyChange.getDefaultCurrencyChange().homogenizeMoney(data.local_currency, {profit_indicator: data.atp_profit_indicator, capital_employed: data.atp_capital_employed}).convertedMoney;
    if (convertedMoney.capital_employed?.amount.equals(0)) {
        return undefined;
    }
    return <BigNumber><unknown>math.divide(convertedMoney.profit_indicator.amount, convertedMoney.capital_employed.amount);
}

function _getKPIROS(data: DataInterface): BigNumber | undefined {
    const convertedMoney = CurrencyChange.getDefaultCurrencyChange().homogenizeMoney(data.local_currency, {profit_indicator: data.atp_profit_indicator, before_sales: data.atp_before_sales}).convertedMoney;
    if (convertedMoney.before_sales?.amount.equals(0)) {
        return undefined;
    }
    return <BigNumber><unknown>math.divide(convertedMoney.profit_indicator.amount, convertedMoney.before_sales.amount);
}

function _getKPIROOGS(data: DataInterface): BigNumber | undefined {
    const convertedMoney = CurrencyChange.getDefaultCurrencyChange().homogenizeMoney(data.local_currency, {profit_indicator: data.atp_profit_indicator, og_sales: data.atp_og_sales}).convertedMoney;
    if (convertedMoney.og_sales?.amount.equals(0)) {
        return undefined;
    }
    return <BigNumber><unknown>math.divide(convertedMoney.profit_indicator.amount, convertedMoney.og_sales.amount);
}

function _getKPIROCOGS(data: DataInterface): BigNumber | undefined {
    const convertedMoney = CurrencyChange.getDefaultCurrencyChange().homogenizeMoney(data.local_currency, {profit_indicator: data.atp_profit_indicator, cogs: data.atp_cogs}).convertedMoney;
    if (convertedMoney.cogs?.amount.equals(0)) {
        return undefined;
    }
    return <BigNumber><unknown>math.divide(convertedMoney.profit_indicator.amount, convertedMoney.cogs.amount);
}

function _getKPIROOE(data: DataInterface): BigNumber | undefined {
    const convertedMoney = CurrencyChange.getDefaultCurrencyChange().homogenizeMoney(data.local_currency, {profit_indicator: data.atp_profit_indicator, operating_expenses: data.atp_operating_expenses}).convertedMoney;
    if (convertedMoney.operating_expenses?.amount.equals(0)) {
        return undefined;
    }
    return <BigNumber><unknown>math.divide(convertedMoney.profit_indicator.amount, convertedMoney.operating_expenses.amount);
}

function _getKPIROC(data: DataInterface): BigNumber | undefined {
    const convertedMoney = CurrencyChange.getDefaultCurrencyChange().homogenizeMoney(data.local_currency, {profit_indicator: data.atp_profit_indicator, before_sales: data.atp_before_sales}).convertedMoney;
    if (math.subtract((convertedMoney.before_sales.amount), (convertedMoney.profit_indicator.amount)).equals(0)) {
        return undefined;
    }
    return <BigNumber><unknown>math.divide(
        convertedMoney.profit_indicator.amount,
        math.subtract(convertedMoney.before_sales.amount, convertedMoney.profit_indicator.amount)
    );
}

function _getKPIRoyalty(data: DataInterface): BigNumber | undefined {
    const convertedMoney = CurrencyChange.getDefaultCurrencyChange().homogenizeMoney(data.local_currency, {profit_indicator: data.atp_profit_indicator, operating_expenses: data.atp_operating_expenses}).convertedMoney;
    if (convertedMoney.operating_expenses?.amount.equals(0)) {
        return undefined;
    }
    return <BigNumber><unknown>math.divide(convertedMoney.profit_indicator.amount, convertedMoney.operating_expenses.amount);
}
