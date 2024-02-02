import {AccountingImpact, RuleApplicationModulation, RulesInterface, TPMethod} from "~/interfaces/rules.interface";
import {
    getValueFromKeyIfTypeCompatible,
    getValueFromKeyIfTypeCompatibleMandatory,
    MoneyType
} from "@algonomia/framework";

export function rulesParser(jsonData: {}[]): RulesInterface[] {
    return jsonData.map(entry => {
        const parsed: RulesInterface = {
            atp_benchmark_first_quartil: getValueFromKeyIfTypeCompatible<number>('atp_benchmark_first_quartil', entry, 'number'),
            atp_benchmark_third_quartil: getValueFromKeyIfTypeCompatible<number>('atp_benchmark_third_quartil', entry, 'number'),
            atp_benchmark_target_below: getValueFromKeyIfTypeCompatible<number>('atp_benchmark_target_below', entry, 'number'),
            atp_benchmark_target_in: getValueFromKeyIfTypeCompatible<number>('atp_benchmark_target_in', entry, 'number'),
            atp_benchmark_target_above: getValueFromKeyIfTypeCompatible<number>('atp_benchmark_target_above', entry, 'number'),
            atp_tp_method: getValueFromKeyIfTypeCompatible<TPMethod>('atp_tp_method', entry, TPMethod),
            atp_date_inf: getValueFromKeyIfTypeCompatible<Date>('atp_date_inf', entry, Date),
            atp_date_sup: getValueFromKeyIfTypeCompatible<Date>('atp_date_sup', entry, Date),
            atp_accounting_impact_for_declaring: getValueFromKeyIfTypeCompatible<AccountingImpact>('atp_accounting_impact_for_declaring', entry, AccountingImpact),
            atp_accounting_impact_for_counterpart: getValueFromKeyIfTypeCompatible<AccountingImpact>('atp_accounting_impact_for_counterpart', entry, AccountingImpact),
            atp_in_scope: getValueFromKeyIfTypeCompatible<boolean>('atp_in_scope', entry, 'boolean'),
            atp_rule_application_modulation: getValueFromKeyIfTypeCompatible<RuleApplicationModulation[]>('atp_rule_application_modulation', entry, RuleApplicationModulation, true),
            atp_tax_rate: getValueFromKeyIfTypeCompatible<number>('atp_tax_rate', entry, 'number'),
            atp_tax_losses_carryforward_depreciation: getValueFromKeyIfTypeCompatible<number>('atp_tax_losses_carryforward_depreciation', entry, 'number'),
            atp_tax_loss_carryforward_ceiling_for_use: MoneyType.moneyTypeParser('atp_tax_loss_carryforward_ceiling_for_use', entry),
            atp_share_of_tax_losses_carryfoward: getValueFromKeyIfTypeCompatible<number>('atp_share_of_tax_losses_carryfoward', entry, 'number'),
            atp_royalties_wht_rates: getValueFromKeyIfTypeCompatible<number>('atp_royalties_wht_rates', entry, 'number'),
            atp_royalties_wht_base: getValueFromKeyIfTypeCompatible<number>('atp_royalties_wht_base', entry, 'number'),
            atp_royalties_wht_deductibility: getValueFromKeyIfTypeCompatible<number>('atp_royalties_wht_deductibility', entry, 'number'),
            atp_royalties_specific_rate: getValueFromKeyIfTypeCompatible<number>('atp_royalties_specific_rate', entry, 'number'),
            atp_royalties_rate_of_exemption: getValueFromKeyIfTypeCompatible<number>('atp_royalties_rate_of_exemption', entry, 'number'),
            atp_royalties_tax_credits: getValueFromKeyIfTypeCompatible<number>('atp_royalties_tax_credits', entry, 'number'),
        }
        Object.keys(entry).forEach(key => {
            if (key.startsWith('atp_declaring_entity_segmentation') || key.startsWith('atp_counterpart_entity_segmentation')) {
                parsed[key] = getValueFromKeyIfTypeCompatibleMandatory<string>(key, entry, 'string');
            }
        });
        return parsed
    });
}
