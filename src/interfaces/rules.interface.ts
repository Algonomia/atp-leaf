import {MoneyType} from "@algonomia/framework";

export interface RulesInterface {
    atp_benchmark_first_quartil?: number;
    atp_benchmark_third_quartil?: number;
    atp_benchmark_target_below?: number;
    atp_benchmark_target_in?: number;
    atp_benchmark_target_above?: number;
    atp_tp_method?: TPMethod;
    atp_date_inf?: Date;
    atp_date_sup?: Date;
    atp_accounting_impact_for_declaring?: AccountingImpact;
    atp_accounting_impact_for_counterpart?: AccountingImpact;
    atp_tax_losses_carryforward_depreciation?: number;
    atp_tax_loss_carryforward_ceiling_for_use?: MoneyType;
    atp_share_of_tax_losses_carryfoward?: number;
    atp_in_scope?: boolean;
    atp_rule_application_modulation?: RuleApplicationModulation[];
    atp_tax_rate?: number;
    atp_royalties_wht_rates?: number;
    atp_royalties_wht_base?: number;
    atp_royalties_wht_deductibility?: number;
    atp_royalties_specific_rate?: number;
    atp_royalties_rate_of_exemption?: number;
    atp_royalties_tax_credits?: number;
    [atp_segmentation: string]: unknown;
}

export enum TPMethod {
    'TNMM ROA' = 'TNMM ROA',
    'TNMM ROCE' = 'TNMM ROCE',
    'TNMM ROS' = 'TNMM ROS',
    'TNMM ROOGS' = 'TNMM ROOGS',
    'TNMM ROCOGS' = 'TNMM ROCOGS',
    'TNMM ROOE' = 'TNMM ROOE',
    'TNMM ROC' = 'TNMM ROC',
    'Royalty' = 'Royalty',
}

export enum RuleApplicationModulation {
    'Apply if inferior' = 1,
    'Apply if superior' = 2,
    'Apply if inside' = 3
}

export enum AccountingImpact {
    'Only Profit indicator' = 1,
    'Operating expenses' = 2,
    'Sales' = 3,
    'COGS' = 4
}

export enum KPIName {
    'Return on Asset' = 1,
    'Return on Capital Employed' = 2,
    'Return on Sales' = 3,
    'Return on Out of Group Sales' = 4,
    'Return on Costs of Goods Solds' = 5,
    'Return on Operating Expenses / Berry Ratio' = 6,
    'Return on Costs' = 7,
    'Royalty rate' = 8,
}
