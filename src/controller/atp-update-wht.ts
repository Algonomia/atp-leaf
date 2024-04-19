import {DataOutputWHTInterface} from "~/interfaces/data.interface";
import {RulesInterface, TPMethod} from "~/interfaces/rules.interface";
import * as math from "mathjs";
import {MoneyType} from "@algonomia/framework";

export function updateWHT(data: DataOutputWHTInterface, counterpart: DataOutputWHTInterface|undefined, tpa: MoneyType|undefined, rule: RulesInterface) {
    if (tpa !== undefined && !tpa.amount.equals(0) && rule.atp_tp_method === TPMethod.Royalty) {
        _updateDeltaWHTRoyaltyPaid(data, rule, tpa);
        _updateDeltaPBTWHTRoyaltyPaid(data, rule, tpa);
        if (counterpart) {
            _updateDeltaWHTRoyaltyRcv(counterpart, rule, tpa);
            _updatePossibleWHTRoyaltyTaxCredits(counterpart, rule, tpa);
            _updateDeltaPBTWHTRoyaltyRcv(counterpart, rule, tpa);
            _updateDeltaTaxWHTRoyaltyRcv(counterpart, rule, tpa);
        }
    }
}

function _updateDeltaWHTRoyaltyRcv(counterpart: DataOutputWHTInterface, rule: RulesInterface, tpa: MoneyType) {
    const toAdd = new MoneyType(
        math.prod(math.bignumber(-1), math.bignumber(rule.atp_royalties_wht_base), math.bignumber(rule.atp_royalties_wht_rates), math.bignumber(tpa.amount)),
        tpa.currency
    );
    counterpart.delta_wht_royalty_received = counterpart.delta_wht_royalty_received?.add([toAdd]) ?? toAdd;
}

function _updateDeltaWHTRoyaltyPaid(data: DataOutputWHTInterface, rule: RulesInterface, tpa: MoneyType) {
    const toAdd = new MoneyType(
        math.prod(math.bignumber(-1), math.bignumber(rule.atp_royalties_wht_base), math.bignumber(rule.atp_royalties_wht_rates), math.bignumber(tpa.amount)),
        tpa.currency
    );
    data.delta_wht_royalty_paid = data.delta_wht_royalty_paid?.add([toAdd]) ?? toAdd;
}

function _updatePossibleWHTRoyaltyTaxCredits(counterpart: DataOutputWHTInterface, rule: RulesInterface, tpa: MoneyType) {
    const toAdd = new MoneyType(
        math.prod(math.bignumber(-1), math.bignumber(rule.atp_royalties_wht_base), math.bignumber(rule.atp_royalties_wht_rates),
            math.bignumber(tpa.amount), math.bignumber(rule.atp_royalties_tax_credits), math.subtract(math.bignumber(1), math.bignumber(rule.atp_royalties_rate_of_exemption))),
        tpa.currency
    );
    counterpart.possible_wht_royalty_tax_credits = counterpart.possible_wht_royalty_tax_credits?.add([toAdd]) ?? toAdd;
}

function _updateDeltaPBTWHTRoyaltyRcv(counterpart: DataOutputWHTInterface, rule: RulesInterface, tpa: MoneyType) {
    const toAdd = new MoneyType(
        math.prod(math.bignumber(rule.atp_royalties_wht_base  ?? 0), math.bignumber(rule.atp_royalties_wht_rates  ?? 0), math.bignumber(tpa.amount), math.bignumber(rule.atp_royalties_rate_of_exemption  ?? 0)),
        tpa.currency
    );
    counterpart.delta_pbt_wht_royalty_received = counterpart.delta_pbt_wht_royalty_received?.add([toAdd]) ?? toAdd;
}

function _updateDeltaPBTWHTRoyaltyPaid(data: DataOutputWHTInterface, rule: RulesInterface, tpa: MoneyType) {
    const toAdd = new MoneyType(
        math.prod(
            math.bignumber(rule.atp_royalties_wht_base ?? 0),
            math.bignumber(rule.atp_royalties_wht_rates ?? 0),
            math.bignumber(tpa.amount),
            math.subtract(math.bignumber(1), math.bignumber(rule.atp_royalties_wht_deductibility  ?? 0))
        ),
        tpa.currency
    );
    data.delta_pbt_wht_royalty_paid = data.delta_pbt_wht_royalty_paid?.add([toAdd]) ?? toAdd;
}

function _updateDeltaTaxWHTRoyaltyRcv(counterpart: DataOutputWHTInterface, rule: RulesInterface, tpa: MoneyType) {
    const toAdd = new MoneyType(
        math.prod(math.bignumber(rule.atp_royalties_wht_base  ?? 0), math.bignumber(rule.atp_royalties_wht_rates  ?? 0),
            math.bignumber(rule.atp_royalties_specific_rate  ?? 0), math.bignumber(tpa.amount), math.bignumber(rule.atp_royalties_rate_of_exemption  ?? 0)),
        tpa.currency
    );
    counterpart.delta_tax_wht_royalty_received = counterpart.delta_tax_wht_royalty_received?.add([toAdd]) ?? toAdd;
}
