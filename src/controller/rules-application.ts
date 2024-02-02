import {RulesInterface} from "~/interfaces/rules.interface";

function filterObject(obj: any) {
    const ret: any = {};
    Object.keys(obj)
        .filter((key) => obj[key] !== undefined)
        .forEach((key) => ret[key] = obj[key]);
    return ret;
}

export function rulesApplication(rules: RulesInterface[], date?: Date): RulesInterface | undefined {
    const applicableRules = rules.filter(rule => {
        if (rule.atp_in_scope === false) {
            return false;
        } else if (date) {
            if (rule.atp_date_inf && date < rule.atp_date_inf) {
                return false;
            } else if (rule.atp_date_sup && date > rule.atp_date_sup) {
                return false;
            }
        }
        return true;
    });
    return applicableRules.length > 0 ? applicableRules.reduce((a, b) => Object.assign({}, b, filterObject(a))) : undefined;
}
