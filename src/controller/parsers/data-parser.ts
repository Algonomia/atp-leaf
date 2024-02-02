import {DataInterface} from "~/interfaces/data.interface";
import {
    getValueFromKeyIfTypeCompatible,
    getValueFromKeyIfTypeCompatibleMandatory,
    MoneyType
} from "@algonomia/framework";

export function dataParser(jsonData: {}[]): DataInterface[] {
    return jsonData.map(entry => {
        const parsed: DataInterface = {
            id: getValueFromKeyIfTypeCompatible<number>('id', entry, 'number'),
            atp_taxpayer: getValueFromKeyIfTypeCompatible<string>('atp_taxpayer', entry, 'string'),
            atp_assets: MoneyType.moneyTypeParser('atp_assets', entry),
            atp_capital_employed: MoneyType.moneyTypeParser('atp_capital_employed', entry),
            atp_before_sales: MoneyType.moneyTypeParser('atp_before_sales', entry),
            atp_og_sales: MoneyType.moneyTypeParser('atp_og_sales', entry),
            atp_cogs: MoneyType.moneyTypeParser('atp_cogs', entry),
            atp_royalty_paid: MoneyType.moneyTypeParser('atp_royalty_paid', entry),
            atp_operating_expenses: MoneyType.moneyTypeParser('atp_operating_expenses', entry),
            atp_profit_indicator: MoneyType.moneyTypeParser('atp_profit_indicator', entry),
            atp_before_pbt: MoneyType.moneyTypeParser('atp_before_pbt', entry),
            atp_before_tax_expenses: MoneyType.moneyTypeParser('atp_before_tax_expenses', entry),
            atp_tax_losses_carryforward_n: MoneyType.moneyTypeParser('atp_tax_losses_carryforward_n', entry),
            atp_tax_losses_carryforward_n1: MoneyType.moneyTypeParser('atp_tax_losses_carryforward_n1', entry),
            atp_tax: MoneyType.moneyTypeParser('atp_tax', entry),
            atp_firm_creation_date: getValueFromKeyIfTypeCompatible<Date>('atp_firm_creation_date', entry, Date),
            atp_base_royalty: MoneyType.moneyTypeParser('atp_base_royalty', entry),
            local_currency: getValueFromKeyIfTypeCompatible<string>('local_currency', entry, 'string')
        };
        Object.keys(entry).forEach(key => {
            if (key.startsWith('atp_declaring_entity_segmentation')) {
                parsed[key] = getValueFromKeyIfTypeCompatibleMandatory<string>(key, entry, 'string');
            }
        });
        return parsed;
    });
}
