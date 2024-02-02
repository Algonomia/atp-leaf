import express from 'express';
import cors from "cors";
import path from "path";
import './paths';
import {dataParser} from "~/controller/parsers/data-parser";
import {rulesParser} from "~/controller/parsers/rules-parser";
import {bestRuleAffectation, rulesAffectation} from "~/controller/rules-affectation";
import {AtpComputation} from "~/controller/atp-computation";
import {setCurrencyChange} from "~/global";
import {exchangesRatesParser} from "@algonomia/framework";

const app = express();
const port = 3000;

app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb'}));
app.use(cors({
    credentials: true,
    origin: 'http://localhost:4200'
}));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './utils/homepage.html'));
});

app.post('/parseData', function(req, res, next) {
    try {
        const data = dataParser(req.body);
        res.send(data);
    } catch (e) {
        console.error(e);
        res.status(500).send(e);
    }
});

app.post('/parseRules', function(req, res, next) {
    try {
        const data = rulesParser(req.body);
        res.send(data);
    } catch (e) {
        console.error(e);
        res.status(500).send(e);
    }
});

app.post('/affectation', function(req, res, next) {
    try {
        const data = rulesAffectation(dataParser(req.body.data), rulesParser(req.body.rules));
        res.send(data);
    } catch (e) {
        console.error(e);
        res.status(500).send(e);
    }
});

app.post('/atpComputation', function(req, res, next) {
    try {
        setCurrencyChange(exchangesRatesParser(req.body.exchangeRates));
        const dataWithRules = bestRuleAffectation(dataParser(req.body.data), rulesParser(req.body.rules));
        const dataOutput = new AtpComputation(dataWithRules).getAtpComputations();
        res.send({dataWithRules, dataOutput});
    } catch (e) {
        console.error(e);
        res.status(500).send(e);
    }
});

app.listen(port, () => {
    return console.log(`server is listening on ${port}`);
});
