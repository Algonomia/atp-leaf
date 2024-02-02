import {KPIName, RuleApplicationModulation} from "~/interfaces/rules.interface";
import {MoneyType} from "@algonomia/framework";

export interface DataInterface {
    id?: number;
    atp_taxpayer?: string;
    atp_assets?: MoneyType;
    atp_capital_employed?: MoneyType;
    atp_before_sales?: MoneyType;
    atp_og_sales?: MoneyType;
    atp_cogs?: MoneyType;
    atp_royalty_paid?: MoneyType;
    atp_operating_expenses?: MoneyType;
    atp_profit_indicator?: MoneyType;
    atp_before_pbt?: MoneyType;
    atp_before_tax_expenses?: MoneyType;
    atp_tax_losses_carryforward_n?: MoneyType;
    atp_tax_losses_carryforward_n1?: MoneyType;
    atp_firm_creation_date?: Date;
    atp_base_royalty?: MoneyType;
    local_currency?: string;
    [atp_segmentation: string]: unknown;
}

export interface DataOutputInterface extends DataInterface {
    atp_tpa_adj_amount: MoneyType;
    atp_sales?: MoneyType;
    atp_pbt?: MoneyType;
    atp_tax_expenses?: MoneyType;
    atp_royalty_received: MoneyType;
    atp_royalty_received_prod_specific_rate: MoneyType;
    atp_taxes_losses_generated_consumed?: MoneyType;
    atp_wht_paid?: MoneyType;

    atp_kpi_value: number;
    atp_kpi_from_rule: KPIName;
    atp_actual_rule_application_modulation: RuleApplicationModulation;
}

export interface DataOutputWHTInterface extends DataOutputInterface {
    delta_wht_royalty_received?: MoneyType;
    delta_wht_royalty_paid?: MoneyType;
    possible_wht_royalty_tax_credits?: MoneyType;
    delta_pbt_wht_royalty_received?: MoneyType;
    delta_pbt_wht_royalty_paid?: MoneyType;
    delta_tax_wht_royalty_received?: MoneyType;
}

export interface DataTaxPayerInterface {
    atp_taxpayer: string;
    atp_pbt?: MoneyType;
    atp_delta_pbt?: MoneyType;
    atp_tax_expenses?: MoneyType;
    atp_tax_losses_carryforward_n?: MoneyType;
    atp_tax_losses_carryforward_n1?: MoneyType;
    atp_tlcf_consumed_init?: MoneyType;
    atp_unexplained_consumed_tlcf?: MoneyType;
    atp_tlcf_created_init?: MoneyType;
    atp_unexplained_created_tlcf?: MoneyType;
    atp_tlcf_created_new?: MoneyType;
    atp_tlcf_consumed_new?: MoneyType;
    atp_new_tlcf_n?: MoneyType;
    atp_delta_tax_init?: MoneyType
    atp_royalty_received?: MoneyType
    atp_royalty_received_prod_specific_rate?: MoneyType
    atp_mean_tax_rate?: MoneyType
    atp_delta_tax_bis?: MoneyType
    atp_consummable_tax_credit?: MoneyType
    atp_tax_final?: MoneyType
    atp_delta_tax?: MoneyType
    atp_taxes_losses_generated_consumed?: MoneyType;
    atp_wht_paid?: MoneyType;

    delta_wht_royalty_received?: MoneyType;
    delta_pbt_wht_royalty_received?: MoneyType;
    delta_pbt_wht_royalty_paid?: MoneyType;
    possible_wht_royalty_tax_credits?: MoneyType;
    delta_tax_wht_royalty_received?: MoneyType;

    rule_atp_tax_losses_carryforward_depreciation?: number;
    rule_atp_tax_loss_carryforward_ceiling_for_use?: MoneyType;
    rule_atp_share_of_tax_losses_carryfoward?: number;
    rule_atp_tax_rate?: number;

    from_data_output: DataOutputWHTInterface[];
}
