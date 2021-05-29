'use strict';

const fs = require('fs');

let rawdata = fs.readFileSync('food.json');
let food = JSON.parse(rawdata);

for (let i in food){
    if (food[i]["ash_(g)"]){
       delete food[i]["ash_(g)"] 
    }  
}

for (let i in food){
    if (food[i]["calcium_(mg)"]){
       delete food[i]["calcium_(mg)"] 
    }
}

for (let i in food){
    if (food[i]["iron_(mg)"]){
       delete food[i]["iron_(mg)"] 
    } 
}

for (let i in food){
    if (food[i]["magnesium_(mg)"]){
       delete food[i]["magnesium_(mg)"] 
    }   
}

for (let i in food){
    if (food[i]["phosphorus_(mg)"]){
       delete food[i]["phosphorus_(mg)"] 
    }   
}

for (let i in food){
    if (food[i]["potassium_(mg)"]){
       delete food[i]["potassium_(mg)"] 
    } 
}

for (let i in food){
    if (food[i]["zinc_(mg)"]){
       delete food[i]["zinc_(mg)"] 
    }   
}

for (let i in food){
    if (food[i]["copper_(mg)"]){
       delete food[i]["copper_(mg)"] 
    }   
}

for (let i in food){
    if (food[i]["manganese_(mg)"]){
       delete food[i]["manganese_(mg)"] 
    } 
}

for (let i in food){
    if (food[i]["selenium_(µg)"]){
       delete food[i]["selenium_(µg)"] 
    }   
}

for (let i in food){
    if (food[i]["vit_c_(mg)"]){
       delete food[i]["vit_c_(mg)"] 
    }   
}

for (let i in food){
    if (food[i]["thiamin_(mg)"]){
       delete food[i]["thiamin_(mg)"] 
    } 
}

for (let i in food){
    if (food[i]["riboflavin_(mg)"]){
       delete food[i]["riboflavin_(mg)"] 
    }   
}

for (let i in food){
    if (food[i]["niacin_(mg)"]){
       delete food[i]["niacin_(mg)"] 
    }   
}

for (let i in food){
    if (food[i]["panto_acid_mg)"]){
       delete food[i]["panto_acid_mg)"] 
    } 
}

for (let i in food){
    if (food[i]["vit_b6_(mg)"]){
       delete food[i]["vit_b6_(mg)"] 
    }   
}

for (let i in food){
    if (food[i]["folate_tot_(µg)"]){
       delete food[i]["folate_tot_(µg)"] 
    }   
}


for (let i in food){
    if (food[i]["folic_acid_(µg)"]){
       delete food[i]["folic_acid_(µg)"] 
    } 
}

for (let i in food){
    if (food[i]["food_folate_(µg)"]){
       delete food[i]["food_folate_(µg)"] 
    }   
}

for (let i in food){
    if (food[i]["folate_dfe_(µg)"]){
       delete food[i]["folate_dfe_(µg)"] 
    }   
}

for (let i in food){
    if (food[i]["choline_tot__(mg)"]){
       delete food[i]["choline_tot__(mg)"] 
    } 
}

for (let i in food){
    if (food[i]["vit_b12_(µg)"]){
       delete food[i]["vit_b12_(µg)"] 
    }   
}

for (let i in food){
    if (food[i]["vit_a_iu"]){
       delete food[i]["vit_a_iu"] 
    }   
}

for (let i in food){
    if (food[i]["vit_a_rae"]){
       delete food[i]["vit_a_rae"] 
    }   
}

for (let i in food){
    if (food[i]["retinol_(µg)"]){
       delete food[i]["retinol_(µg)"] 
    } 
}

for (let i in food){
    if (food[i]["alpha_carot_(µg)"]){
       delete food[i]["alpha_carot_(µg)"] 
    }   
}

for (let i in food){
    if (food[i]["beta_carot_(µg)"]){
       delete food[i]["beta_carot_(µg)"] 
    }   
}

for (let i in food){
    if (food[i]["beta_crypt_(µg)"]){
       delete food[i]["beta_crypt_(µg)"] 
    }   
}

for (let i in food){
    if (food[i]["lycopene_(µg)"]){
       delete food[i]["lycopene_(µg)"] 
    } 
}

for (let i in food){
    if (food[i]["lut+zea__(µg)"]){
       delete food[i]["lut+zea__(µg)"] 
    }   
}

for (let i in food){
    if (food[i]["vit_e_(mg)"]){
       delete food[i]["vit_e_(mg)"] 
    }   
}

for (let i in food){
    if (food[i]["vit_d_µg"]){
       delete food[i]["vit_d_µg"] 
    } 
}

for (let i in food){
    if (food[i]["vit_d_iu"]){
       delete food[i]["vit_d_iu"] 
    }   
}

for (let i in food){
    if (food[i]["vit_k_(µg)"]){
       delete food[i]["vit_k_(µg)"] 
    }   
}

for (let i in food){
    if (food[i]["gmwt_1"]){
       delete food[i]["gmwt_1"] 
    }   
}

for (let i in food){
    if (food[i]["gmwt_desc1"]){
       delete food[i]["gmwt_desc1"] 
    } 
}

for (let i in food){
    if (food[i]["gmwt_2"]){
       delete food[i]["gmwt_2"] 
    }   
}

for (let i in food){
    if (food[i]["gmwt_desc2"]){
       delete food[i]["gmwt_desc2"] 
    }   
}

for (let i in food){
    if (food[i]["refuse_pct"]){
       delete food[i]["refuse_pct"] 
    }   
}
fs.writeFileSync("programming.json", JSON.stringify(food));
