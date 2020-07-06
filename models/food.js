


'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const foodSchema = new Schema({
    ndb_no: { type: String, required: true },
    shrt_desc: { type: String, required: false },
    'water_(g)': { type: String, required: false },
    energ_kcal: { type: String, required: false },
    'protein_(g)': { type: String, required: false },
    'lipid_tot_(g)': { type: String, required: false },
    'ash_(g)': { type: String, required: false },
    'carbohydrt_(g)': { type: String, required: false },
    'fiber_td_(g)': { type: String, required: false },
    'sugar_tot_(g)': { type: String, required: false },
    'calcium_(mg)': { type: String, required: false },
    'iron_(mg)': { type: String, required: false },
    'magnesium_(mg)': { type: String, required: false },
    'phosphorus_(mg)': { type: String, required: false },
    'potassium_(mg': { type: String, required: false },
    'sodium_(mg)': { type: String, required: false },
    'zinc_(mg)': { type: String, required: false },
    'copper_mg)': { type: String, required: false },
    'manganese_(mg)': { type: String, required: false },
    'selenium_(µg)': { type: String, required: false },
    'vit_c_(mg)': { type: String, required: false },
    'thiamin_(mg)': { type: String, required: false },
    'riboflavin_(mg)': { type: String, required: false },
    'niacin_(mg)': { type: String, required: false },
    'panto_acid_mg)': { type: String, required: false },
    'vit_b6_(mg)': { type: String, required: false },
    'folate_tot_(µg)': { type: String, required: false },
    'folic_acid_(µg)': { type: String, required: false },
    'food_folate_(µg)': { type: String, required: false },
    'folate_dfe_(µg)': { type: String, required: false },
    'choline_tot__(mg)': { type: String, required: false },
    'vit_b12_(µg)': { type: String, required: false },
    'vit_a_iu': { type: String, required: false },
    'vit_a_rae': { type: String, required: false },
    'retinol_(µg)': { type: String, required: false },
    'alpha_carot_(µg)': { type: String, required: false },
    'beta_carot_(µg)': { type: String, required: false },
    'beta_crypt_(µg)': { type: String, required: false },
    'lycopene_(µg)': { type: String, required: false },
    'lut+zea__(µg)': { type: String, required: false },
    'vit_e_(mg)': { type: String, required: false },
    'vit_d_µg': { type: String, required: false },
    'vit_d_iu': { type: String, required: false },
    'vit_k_(µg)': { type: String, required: false },
    'fa_sat_(g)': { type: String, required: false },
    'fa_mono_(g)': { type: String, required: false },
    'fa_poly_(g)': { type: String, required: false },
    'cholestrl_(mg)': { type: String, required: false },
    'gmwt_1': { type: String, required: false },
    'gmwt_desc1': { type: String, required: false },
    'gmwt_2': { type: String, required: false },
    'gmwt_desc2': { type: String, required: false },
    'refuse_pct': { type: String, required: false }
});

let Food = module.exports = mongoose.model("food", foodSchema);