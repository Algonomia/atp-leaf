import {CurrencyChange, ExchangesRatesInterface} from "@algonomia/framework";

export const sumTPAThreshold = 0.01;
export const percentDecreaseThreshold = 5;
export const percentNumberOfIterations = 5;
export const maxIterationsMultiplier = 20;

export function setCurrencyChange(exchangesRates?: ExchangesRatesInterface[]) {
    CurrencyChange.getDefaultCurrencyChange = () => new CurrencyChange(exchangesRates);
}
