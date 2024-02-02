import {rulesParser} from "~/controller/parsers/rules-parser";
import rulesJson from "~/spec/rules.json";
import dataJson from "~/spec/data.json";
import rulesJsonSpecs from "~/spec/rulesSpecs.json";
import dataJsonSpecs from "~/spec/dataSpecs.json";
import {dataParser} from "./parsers/data-parser";
import {AtpComputation} from "./atp-computation";
import {bestRuleAffectation} from "./rules-affectation";
import {setCurrencyChange} from "../global";
import {CurrencyChange} from "./currency-change";

describe("ATP Computation tests", function () {

   it("should parse json rules", function () {
      const rules = rulesParser(rulesJson);
      expect(rules.length).toEqual(1);
   });

   it("should parse json data", function () {
      const data = dataParser(dataJson);
      expect(data.length).toEqual(2);
   });

   it("should get the best matching rules for data", function () {
      const bestMatching = bestRuleAffectation(dataParser(dataJson), rulesParser(rulesJson));
      expect(bestMatching.length).toEqual(2);
      expect(bestMatching.map(([data, rule]) => rule).filter(rule => rule).length).toEqual(1);
   });

   it("should get the tpa computation", function () {
      setCurrencyChange(new CurrencyChange());
      const atpComputed = new AtpComputation(bestRuleAffectation(dataParser(dataJson), rulesParser(rulesJson))).getAtpComputations();
      expect(atpComputed.length).toEqual(2);
   });
});

describe("ATP rules matching", function () {
   it("should get the best rules matching", () => {
      const bestMatching = bestRuleAffectation(dataParser(dataJsonSpecs), rulesParser(rulesJsonSpecs));
      expect(bestMatching.length).toEqual(6);
      expect(bestMatching[0][1]?.atp_benchmark_target_below).toEqual(0.02);
      expect(bestMatching[0][1]?.atp_benchmark_target_in).toEqual(0.05);
      expect(bestMatching[0][1]?.atp_benchmark_target_above).toEqual(0.105);
      expect(bestMatching[1][1]?.atp_benchmark_target_below).toEqual(1);
      expect(bestMatching[1][1]?.atp_benchmark_target_in).toEqual(0.5);
      expect(bestMatching[1][1]?.atp_benchmark_target_above).toEqual(0.205);
   });
});
