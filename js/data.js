/* Pipe Support Span Trial v0.1.1 — seed data and dimensional basis.
   PIM-2 class records are intentionally limited to classes verified from the supplied PMC source.
   Steel span reference is based on MSS SP-58 Table 4 preliminary spacing categories. */

const G = 9.80665;
const WATER_DENSITY = 998;

const NPS_ORDER = ["1/2","3/4","1","1 1/4","1 1/2","2","2 1/2","3","3 1/2","4","5","6","8","10","12","14","16","18","20","24"];

const SPAN_TABLE = {
  "1/2":   {water:2.1, vapor:2.7},
  "3/4":   {water:2.1, vapor:2.7},
  "1":     {water:2.1, vapor:2.7},
  "1 1/4": {water:2.1, vapor:3.7},
  "1 1/2": {water:2.7, vapor:4.0},
  "2":     {water:3.0, vapor:4.0},
  "2 1/2": {water:3.4, vapor:4.3},
  "3":     {water:3.7, vapor:4.6},
  "3 1/2": {water:4.0, vapor:4.9},
  "4":     {water:4.3, vapor:5.2},
  "5":     {water:4.9, vapor:5.8},
  "6":     {water:5.2, vapor:6.4},
  "8":     {water:5.8, vapor:7.3},
  "10":    {water:6.7, vapor:7.9},
  "12":    {water:7.0, vapor:9.1},
  "14":    {water:7.6, vapor:9.8},
  "16":    {water:8.2, vapor:10.7},
  "18":    {water:8.5, vapor:11.3},
  "20":    {water:9.1, vapor:11.9},
  "24":    {water:9.8, vapor:12.8}
};

const OD_MM = {
  "1/2":21.3, "3/4":26.7, "1":33.4, "1 1/4":42.2, "1 1/2":48.3,
  "2":60.3, "2 1/2":73.0, "3":88.9, "3 1/2":101.6, "4":114.3,
  "5":141.3, "6":168.3, "8":219.1, "10":273.0, "12":323.8,
  "14":355.6, "16":406.4, "18":457.2, "20":508.0, "24":609.6
};

const WT_MM = {
  "SCH 10S":{"1/2":2.11,"3/4":2.11,"1":2.77,"1 1/4":2.77,"1 1/2":2.77,"2":2.77,"2 1/2":3.05,"3":3.05,"3 1/2":3.05,"4":3.05,"5":3.40,"6":3.40,"8":3.76,"10":4.19,"12":4.57,"14":4.78,"16":4.78},
  "SCH 20":{"8":6.35,"10":6.35,"12":6.35,"14":7.92,"16":7.92},
  "SCH 40":{"1/2":2.77,"3/4":2.87,"1":3.38,"1 1/4":3.56,"1 1/2":3.68,"2":3.91,"2 1/2":5.16,"3":5.49,"3 1/2":5.74,"4":6.02,"5":6.55,"6":7.11,"8":8.18,"10":9.27,"12":10.31,"14":11.13,"16":12.70,"18":14.27,"20":15.09,"24":17.48},
  "SCH 40S":{"1/2":2.77,"3/4":2.87,"1":3.38,"1 1/4":3.56,"1 1/2":3.68,"2":3.91,"2 1/2":5.16,"3":5.49,"3 1/2":5.74,"4":6.02,"5":6.55,"6":7.11,"8":8.18,"10":9.27,"12":10.31},
  "SCH 80":{"1/2":3.73,"3/4":3.91,"1":4.55,"1 1/4":4.85,"1 1/2":5.08,"2":5.54,"2 1/2":7.01,"3":7.62,"3 1/2":8.08,"4":8.56,"5":9.53,"6":10.97,"8":12.70,"10":15.09,"12":17.48,"14":19.05,"16":21.44,"18":23.83,"20":26.19,"24":30.96},
  "SCH 120":{"2":6.35,"2 1/2":7.01,"3":8.74,"3 1/2":9.53,"4":11.13,"5":12.70,"6":14.27,"8":18.26,"10":21.44,"12":25.40,"14":27.79,"16":30.96},
  "SCH 140":{"8":20.62,"10":25.40,"12":28.58,"14":31.75,"16":36.53},
  "SCH 160":{"1/2":4.78,"3/4":5.56,"1":6.35,"1 1/4":6.35,"1 1/2":7.14,"2":8.74,"2 1/2":9.53,"3":11.13,"3 1/2":12.70,"4":13.49,"5":15.88,"6":18.26,"8":23.01,"10":28.58,"12":33.32,"14":35.71,"16":40.49},
  "STD":{"1/2":2.77,"3/4":2.87,"1":3.38,"1 1/4":3.56,"1 1/2":3.68,"2":3.91,"2 1/2":5.16,"3":5.49,"3 1/2":5.74,"4":6.02,"5":6.55,"6":7.11,"8":8.18,"10":9.27,"12":9.53,"14":9.53,"16":9.53,"18":9.53,"20":9.53,"24":9.53}
};

function sizesInRanges(ranges) {
  return NPS_ORDER.filter(nps => ranges.some(r => {
    const i = NPS_ORDER.indexOf(nps), a = NPS_ORDER.indexOf(r.from), b = NPS_ORDER.indexOf(r.to);
    return i >= a && i <= b;
  }));
}
function scheduleFor(ranges, nps) {
  const i = NPS_ORDER.indexOf(nps);
  const found = ranges.find(r => i >= NPS_ORDER.indexOf(r.from) && i <= NPS_ORDER.indexOf(r.to));
  return found ? found.schedule : null;
}

const PIM2_CLASSES = {
  "A1A2": {
    service:"Ammonia (Gas)", group:"vapor", material:"A106 Gr.B / A672 Gr.B60 Cl.13", metal:"CS",
    density:0, densityNote:"Gas content weight initially set to zero; enter project density when required.",
    ranges:[{from:"1/2",to:"1 1/2",schedule:"SCH 80"},{from:"2",to:"6",schedule:"SCH 40"},{from:"8",to:"16",schedule:"SCH 20"},{from:"18",to:"24",schedule:"STD"}]
  },
  "A1A2X": {
    service:"aMDEA Solution", group:"liquid", material:"A106 Gr.B", metal:"CS",
    density:null, densityNote:"Enter operating solution density for support load calculation.",
    ranges:[{from:"1/2",to:"1 1/2",schedule:"SCH 80"},{from:"2",to:"6",schedule:"SCH 40"},{from:"8",to:"16",schedule:"SCH 20"},{from:"18",to:"24",schedule:"STD"}]
  },
  "A1A2XP": {
    service:"aMDEA Solution (>82°C)", group:"liquid", material:"A106 Gr.B", metal:"CS",
    density:null, densityNote:"Enter operating solution density for support load calculation.",
    ranges:[{from:"1/2",to:"1 1/2",schedule:"SCH 80"},{from:"2",to:"6",schedule:"SCH 40"},{from:"8",to:"16",schedule:"SCH 20"},{from:"18",to:"24",schedule:"STD"}]
  },
  "A1K1U": {
    service:"Chemical Drain", group:"liquid", material:"A312/A358 Gr.304", metal:"SS",
    density:null, densityNote:"Enter operating drain fluid density.",
    ranges:[{from:"1/2",to:"1 1/2",schedule:"SCH 40S"},{from:"2",to:"4",schedule:"SCH 10S"},{from:"6",to:"16",schedule:"SCH 10S"}]
  },
  "AAA22": {
    service:"Fire Water", group:"liquid", material:"A106 Gr.B / API 5L Gr.B", metal:"CS",
    density:998, densityNote:"Default water density is editable.",
    ranges:[{from:"1/2",to:"1 1/2",schedule:"SCH 80"},{from:"2",to:"6",schedule:"SCH 40"},{from:"8",to:"16",schedule:"SCH 20"}]
  },
  "ABA2": {
    service:"Plant Air", group:"vapor", material:"A106 Gr.B / API 5L Gr.B", metal:"CS",
    density:0, densityNote:"Air content weight initially set to zero; enter density when required.",
    ranges:[{from:"1/2",to:"1 1/2",schedule:"SCH 80"},{from:"2",to:"6",schedule:"SCH 40"}]
  },
  "BSA2J": {
    service:"Steam Jacket (20 kg/cm²g)", group:"vapor", material:"A106 Gr.B", metal:"CS",
    density:0, densityNote:"Steam content weight initially set to zero; enter density when required.",
    ranges:[{from:"1/2",to:"1 1/2",schedule:"SCH 80"},{from:"2",to:"16",schedule:"SCH 40"}]
  },
  "D1A4X": {
    service:"aMDEA Solution", group:"liquid", material:"A106 Gr.B", metal:"CS",
    density:null, densityNote:"Enter operating solution density for support load calculation.",
    ranges:[{from:"1/2",to:"2",schedule:"SCH 160"},{from:"3",to:"16",schedule:"SCH 80"}]
  },
  "DSA2": {
    service:"Boiler Feed Water", group:"liquid", material:"A106 Gr.B", metal:"CS",
    density:998, densityNote:"Default water density is editable.",
    ranges:[{from:"1/2",to:"1 1/2",schedule:"SCH 80"},{from:"2",to:"16",schedule:"SCH 80"}]
  },
  "ERA2": {
    service:"Chemical Feed (Phosphate)", group:"liquid", material:"A106 Gr.B", metal:"CS",
    density:null, densityNote:"Enter operating chemical solution density.",
    ranges:[{from:"1/2",to:"3",schedule:"SCH 80"},{from:"4",to:"4",schedule:"SCH 120"}]
  },
  "F1A2": {
    service:"Ammonia (Liquid)", group:"liquid", material:"A106 Gr.B", metal:"CS",
    density:673.3, densityNote:"Editable preliminary liquid ammonia density preset.",
    ranges:[{from:"1/2",to:"6",schedule:"SCH 160"},{from:"8",to:"16",schedule:"SCH 140"}]
  },
  "FDA2": {
    service:"Fuel Gas", group:"vapor", material:"A106 Gr.B", metal:"CS",
    density:0, densityNote:"Gas content weight initially set to zero; enter project density when required.",
    ranges:[{from:"1/2",to:"6",schedule:"SCH 160"}]
  },
  "FSA2": {
    service:"Boiler Feed Water", group:"liquid", material:"A106 Gr.B", metal:"CS",
    density:998, densityNote:"Default water density is editable.",
    ranges:[{from:"1/2",to:"6",schedule:"SCH 160"},{from:"8",to:"16",schedule:"SCH 140"}]
  },
  "M1J1J": {
    service:"Mixed Gas (Jacketed)", group:"vapor", material:"A312 Gr.TP316L", metal:"SS",
    density:0, densityNote:"Process gas content weight initially set to zero; jacket effects require separate check.",
    ranges:[{from:"1/2",to:"12",schedule:"SCH 160"}]
  }
};

const METAL_DENSITY = {CS:7850, SS:8000};
