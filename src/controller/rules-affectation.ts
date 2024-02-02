import {DataInterface} from "~/interfaces/data.interface";
import {RulesInterface} from "~/interfaces/rules.interface";
import {rulesApplication} from "~/controller/rules-application";
import * as console from "console";

export function rulesAffectation(data: DataInterface[], rules: RulesInterface[]): [DataInterface, RulesInterface[]][] {
    const ret: [DataInterface, RulesInterface[]] [] = data.map(d => [d, []]);
    const orderedRules = rules.sort((a, b) => {
        const scoreA = Object.keys(a).filter(key => key.startsWith('atp_declaring_entity_segmentation'))
            .reduce((a, b) => Math.min(a, Number(b.split('_').pop())), Infinity);
        const scoreB = Object.keys(b).filter(key => key.startsWith('atp_declaring_entity_segmentation'))
            .reduce((a, b) => Math.min(a, Number(b.split('_').pop())), Infinity);
        return scoreA > scoreB ? 1 : -1;
    });
    orderedRules.forEach(rule => {
        const segmentationKeys = Object.keys(rule).filter(key => key.startsWith('atp_declaring_entity_segmentation'));
        ret.forEach(entry => {
            if (segmentationKeys.every((segKey: string) => entry[0][segKey] === rule[segKey])) {
                entry[1].push(rule);
            }
        })
    });
    return ret;
}

export function bestRuleResolution(dataWithCompatibleRules: [DataInterface, RulesInterface[]][]): [DataInterface, RulesInterface|undefined][] {
    return <[DataInterface, RulesInterface|undefined][]>dataWithCompatibleRules
        .map(([data, rule]) => ([data, rulesApplication(rule, data.atp_firm_creation_date)]));
}

export function bestRuleAffectation(data: DataInterface[], rules: RulesInterface[]): [DataInterface, RulesInterface|undefined][] {
    const dataWithCompatibleRules = rulesAffectation(data, rules);
    return bestRuleResolution(dataWithCompatibleRules);
}

export function getCounterpart<T>(data: T[], rule: RulesInterface): T {
    const segmentationKeys = [...Object.keys(data), ...Object.keys(rule)].filter(key => key.startsWith('atp_counterpart_entity_segmentation'));
    const matchingCounterparts = data.filter(data => segmentationKeys.every((segKey: string) =>
        (<DataInterface><unknown>data)[segKey.replace('atp_counterpart_entity_segmentation', 'atp_declaring_entity_segmentation')] === rule[segKey]));
    if (matchingCounterparts.length === 0) {
        throw new Error('No counterpart matching for rule:' + rule);
    } else if (matchingCounterparts.length > 1) {
        console.log(rule);
        throw new Error('Too many counterparts matching for rule:' + rule);
    }
    return matchingCounterparts[0];
}
