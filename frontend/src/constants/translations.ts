export type Language = 'en' | 'hi' | 'pa';

export interface Translations {
  cropPlanner: string;
  satelliteMap: string;
  droughtStressTest: string;
  selectedFarmRegion: string;
  gpsDetect: string;
  locating: string;
  totalLandArea: string;
  groundwaterLevel: string;
  waterSaved: string;
  estimatedNetProfit: string;
  farmTargetTitle: string;
  farmTargetSubtitle: string;
  normalYear: string;
  mildShortage: string;
  severeDrought: string;
  crisis: string;
  totalFarmArea: string;
  availableBorewellWater: string;
  minimumFoodTarget: string;
  netProfitTarget: string;
  generatePlanBtn: string;
  calculating: string;
  cropsEligibleTitle: string;
  cropsEligibleSubtitle: string;
  recommendedPlanTitle: string;
  viewReportBtn: string;
  printCardBtn: string;
  waterConsumed: string;
  foodHarvested: string;
  netProfit: string;
  acreageShareTitle: string;
  actionPlanTitle: string;
  cropToPlant: string;
  landSize: string;
  expectedHarvest: string;
  waterNeeded: string;
  netFarmerProfit: string;
  drawPlotBtn: string;
  finishDrawingBtn: string;
  clearPlotBtn: string;
  drawPlotPrompt: string;
  beforeAfterTitle: string;
  traditionalPaddy: string;
  aquashiftPlan: string;
  waterPumped: string;
  borewellLife: string;
  farmerIncome: string;
  foodProduced: string;
  impactVerdict: string;
}

export const TRANSLATIONS: Record<Language, Translations> = {
  en: {
    cropPlanner: "Crop Planner",
    satelliteMap: "Satellite Map",
    droughtStressTest: "Drought Stress Test",
    selectedFarmRegion: "Selected Farm Region",
    gpsDetect: "GPS Detect",
    locating: "Locating...",
    totalLandArea: "Total Land Area",
    groundwaterLevel: "Groundwater Level",
    waterSaved: "Water Saved",
    estimatedNetProfit: "Estimated Net Profit",
    farmTargetTitle: "Farm Target & Water Budget Settings",
    farmTargetSubtitle: "Set your land size, borewell water availability, and income targets.",
    normalYear: "Normal Year",
    mildShortage: "Mild Shortage (-20%)",
    severeDrought: "Severe Drought (-50%)",
    crisis: "Crisis",
    totalFarmArea: "Total Farm Area",
    availableBorewellWater: "Available Borewell Water",
    minimumFoodTarget: "Minimum Food Target",
    netProfitTarget: "Net Profit Target",
    generatePlanBtn: "Generate My Crop Plan Now",
    calculating: "Calculating Optimal Allocation...",
    cropsEligibleTitle: "Crops Eligible for Planting",
    cropsEligibleSubtitle: "Click any crop to include or exclude it from seasonal planning mix.",
    recommendedPlanTitle: "Recommended Seasonal Crop Plan",
    viewReportBtn: "View Farmer Advisory Report (PDF)",
    printCardBtn: "Print Kisan Advisory Card",
    waterConsumed: "Water Consumed",
    foodHarvested: "Food Harvested",
    netProfit: "Estimated Net Profit",
    acreageShareTitle: "Crop Acreage Allocation Share",
    actionPlanTitle: "Crop-by-Crop Seasonal Planting Action Plan",
    cropToPlant: "Crop to Plant",
    landSize: "Land Size",
    expectedHarvest: "Expected Harvest",
    waterNeeded: "Water Needed",
    netFarmerProfit: "Net Farmer Profit",
    drawPlotBtn: "✏️ Draw My Plot",
    finishDrawingBtn: "✓ Finish Drawing",
    clearPlotBtn: "Reset Boundary",
    drawPlotPrompt: "Click 3 or more points on the satellite map to outline your exact field boundary.",
    beforeAfterTitle: "Traditional Flood-Paddy Monoculture vs. AquaShift Optimized Plan",
    traditionalPaddy: "Traditional Paddy Monoculture",
    aquashiftPlan: "AquaShift Diversified Plan",
    waterPumped: "Groundwater Pumped",
    borewellLife: "Borewell Depletion Risk",
    farmerIncome: "Net Farmer Income",
    foodProduced: "Food Production",
    impactVerdict: "Saves groundwater from critical depletion while increasing seasonal farmer income by +128%!"
  },
  hi: {
    cropPlanner: "फसल योजना",
    satelliteMap: "उपग्रह नक्शा",
    droughtStressTest: "सूखा तनाव परीक्षण",
    selectedFarmRegion: "चयनित कृषि क्षेत्र",
    gpsDetect: "जीपीएस खोजें",
    locating: "स्थान खोज रहा है...",
    totalLandArea: "कुल खेत क्षेत्रफल",
    groundwaterLevel: "भूजल स्तर (गहराई)",
    waterSaved: "बचाया गया पानी",
    estimatedNetProfit: "अनुमानित शुद्ध मुनाफा",
    farmTargetTitle: "खेत लक्ष्य एवं भूजल बजट सेटिंग्स",
    farmTargetSubtitle: "अपनी जमीन का आकार, ट्यूबवेल पानी और आय लक्ष्य निर्धारित करें।",
    normalYear: "सामान्य वर्ष",
    mildShortage: "हल्की कमी (-20%)",
    severeDrought: "गंभीर सूखा (-50%)",
    crisis: "आपातकालीन संकट",
    totalFarmArea: "कुल खेत का रकबा",
    availableBorewellWater: "उपलब्ध ट्यूबवेल पानी",
    minimumFoodTarget: "न्यूनतम खाद्यान्न लक्ष्य",
    netProfitTarget: "शुद्ध मुनाफा लक्ष्य",
    generatePlanBtn: "मेरी फसल योजना बनाएं",
    calculating: "इष्टतम फसल आवंटन की गणना...",
    cropsEligibleTitle: "बुवाई योग्य उम्मीदवार फसलें",
    cropsEligibleSubtitle: "फसल को शामिल या बाहर करने के लिए उस पर क्लिक करें।",
    recommendedPlanTitle: "सिफारिश की गई मौसमी फसल योजना",
    viewReportBtn: "किसान सलाह रिपोर्ट देखें (PDF)",
    printCardBtn: "किसान सलाहकार कार्ड प्रिंट करें",
    waterConsumed: "खर्च हुआ पानी",
    foodHarvested: "खाद्यान्न उत्पादन",
    netProfit: "अनुमानित शुद्ध मुनाफा",
    acreageShareTitle: "फसलवार रकबा हिस्सेदारी",
    actionPlanTitle: "फसल-दर-फसल मौसमी बुवाई कार्ययोजना",
    cropToPlant: "बोने योग्य फसल",
    landSize: "जमीन का रकबा",
    expectedHarvest: "अपेक्षित पैदावार",
    waterNeeded: "आवश्यक पानी",
    netFarmerProfit: "किसान का शुद्ध मुनाफा",
    drawPlotBtn: "✏️ अपना खेत बनाएं",
    finishDrawingBtn: "✓ ड्राइंग पूरी करें",
    clearPlotBtn: "सीमा रीसेट करें",
    drawPlotPrompt: "उपग्रह मानचित्र पर 3 या अधिक बिंदुओं पर क्लिक करके अपने खेत की सीमा बनाएं।",
    beforeAfterTitle: "पारंपरिक धान मोनोकल्चर बनाम एक्वाशिफ्ट अनुकूलित फसल योजना",
    traditionalPaddy: "पारंपरिक धान (बाढ़ सिंचाई)",
    aquashiftPlan: "एक्वाशिफ्ट विविध फसल योजना",
    waterPumped: "पंप किया गया भूजल",
    borewellLife: "ट्यूबवेल सूखने का जोखिम",
    farmerIncome: "किसान की शुद्ध आय",
    foodProduced: "खाद्यान्न पैदावार",
    impactVerdict: "भूजल को सूखने से बचाते हुए किसान की मौसमी आय में +128% की बढ़ोतरी करता है!"
  },
  pa: {
    cropPlanner: "ਫ਼ਸਲ ਯੋਜਨਾ",
    satelliteMap: "ਸੈਟੇਲਾਈਟ ਨਕਸ਼ਾ",
    droughtStressTest: "ਸੋਕਾ ਤਣਾਅ ਟੈਸਟ",
    selectedFarmRegion: "ਚੁਣਿਆ ਖੇਤੀ ਇਲਾਕਾ",
    gpsDetect: "ਜੀਪੀਐਸ ਲੱਭੋ",
    locating: "ਸਥਾਨ ਲੱਭ ਰਿਹਾ ਹੈ...",
    totalLandArea: "ਕੁੱਲ ਖੇਤ ਰਕਬਾ",
    groundwaterLevel: "ਧਰਤੀ ਹੇਠਲਾ ਪਾਣੀ ਪੱਧਰ",
    waterSaved: "ਬਚਾਇਆ ਗਿਆ ਪਾਣੀ",
    estimatedNetProfit: "ਅਨੁਮਾਨਿਤ ਸ਼ੁੱਧ ਮੁਨਾਫ਼ਾ",
    farmTargetTitle: "ਖੇਤ ਟੀਚਾ ਅਤੇ ਟਿਊਬਵੈੱਲ ਪਾਣੀ ਸੈਟਿੰਗਜ਼",
    farmTargetSubtitle: "ਆਪਣੀ ਜ਼ਮੀਨ, ਟਿਊਬਵੈੱਲ ਪਾਣੀ ਦੀ ਮਾਤਰਾ ਅਤੇ ਆਮਦਨ ਟੀਚਾ ਤੈਅ ਕਰੋ।",
    normalYear: "ਆਮ ਸਾਲ",
    mildShortage: "ਹਲਕੀ ਘਾਟ (-20%)",
    severeDrought: "ਗੰਭੀਰ ਸੋਕਾ (-50%)",
    crisis: "ਸੰਕਟਕਾਲ",
    totalFarmArea: "ਕੁੱਲ ਖੇਤ ਰਕਬਾ",
    availableBorewellWater: "ਉਪਲਬਧ ਟਿਊਬਵੈੱਲ ਪਾਣੀ",
    minimumFoodTarget: "ਘੱਟੋ-ਘੱਟ ਅਨਾਜ ਟੀਚਾ",
    netProfitTarget: "ਸ਼ੁੱਧ ਮੁਨਾਫ਼ਾ ਟੀਚਾ",
    generatePlanBtn: "ਮੇਰੀ ਫ਼ਸਲ ਯੋਜਨਾ ਬਣਾਓ",
    calculating: "ਫ਼ਸਲ ਵੰਡ ਦੀ ਗਣਨਾ ਹੋ ਰਹੀ ਹੈ...",
    cropsEligibleTitle: "ਬਿਜਾਈ ਯੋਗ ਫ਼ਸਲਾਂ",
    cropsEligibleSubtitle: "ਫ਼ਸਲ ਨੂੰ ਚੁਣਨ ਜਾਂ ਹਟਾਉਣ ਲਈ ਕਲਿੱਕ ਕਰੋ।",
    recommendedPlanTitle: "ਸਿਫਾਰਸ਼ ਕੀਤੀ ਮੌਸਮੀ ਫ਼ਸਲ ਯੋਜਨਾ",
    viewReportBtn: "ਕਿਸਾਨ ਸਲਾਹ ਰਿਪੋਰਟ ਦੇਖੋ (PDF)",
    printCardBtn: "ਕਿਸਾਨ ਸਲਾਹ ਕਾਰਡ ਪ੍ਰਿੰਟ ਕਰੋ",
    waterConsumed: "ਵਰਤਿਆ ਗਿਆ ਪਾਣੀ",
    foodHarvested: "ਕੁੱਲ ਅਨਾਜ ਪੈਦਾਵਾਰ",
    netProfit: "ਅਨੁਮਾਨਿਤ ਸ਼ੁੱਧ ਮੁਨਾਫ਼ਾ",
    acreageShareTitle: "ਫ਼ਸਲਵਾਰ ਰਕਬਾ ਵੰਡ",
    actionPlanTitle: "ਫ਼ਸਲ ਅਨੁਸਾਰ ਮੌਸਮੀ ਬਿਜਾਈ ਕਾਰਜ ਯੋਜਨਾ",
    cropToPlant: "ਬੀਜਣ ਯੋਗ ਫ਼ਸਲ",
    landSize: "ਜ਼ਮੀਨ ਦਾ ਰਕਬਾ",
    expectedHarvest: "ਅਨੁਮਾਨਿਤ ਝਾੜ",
    waterNeeded: "ਲੋੜੀਂਦਾ ਪਾਣੀ",
    netFarmerProfit: "ਕਿਸਾਨ ਦਾ ਸ਼ੁੱਧ ਮੁਨਾਫ਼ਾ",
    drawPlotBtn: "✏️ ਆਪਣਾ ਖੇਤ ਬਣਾਓ",
    finishDrawingBtn: "✓ ਖੇਤ ਪੂਰਾ ਕਰੋ",
    clearPlotBtn: "ਮੁੜ ਸੈੱਟ ਕਰੋ",
    drawPlotPrompt: "ਸੈਟੇਲਾਈਟ ਨਕਸ਼ੇ 'ਤੇ 3 ਜਾਂ ਵੱਧ ਥਾਵਾਂ 'ਤੇ ਕਲਿੱਕ ਕਰਕੇ ਆਪਣੇ ਖੇਤ ਦੀ ਹੱਦਬੰਦੀ ਕਰੋ।",
    beforeAfterTitle: "ਰਵਾਇਤੀ ਝੋਨਾ ਕਾਸ਼ਤ ਬਨਾਮ ਐਕਵਾਸ਼ਿਫਟ ਵੰਨ-ਸੁਵੰਨੀ ਫ਼ਸਲ ਯੋਜਨਾ",
    traditionalPaddy: "ਰਵਾਇਤੀ ਝੋਨਾ (ਹੜ੍ਹ ਸਿੰਚਾਈ)",
    aquashiftPlan: "ਐਕਵਾਸ਼ਿਫਟ ਵੰਨ-ਸੁਵੰਨੀ ਯੋਜਨਾ",
    waterPumped: "ਟਿਊਬਵੈੱਲ 'ਚੋਂ ਕੱਢਿਆ ਪਾਣੀ",
    borewellLife: "ਟਿਊਬਵੈੱਲ ਫੇਲ੍ਹ ਹੋਣ ਦਾ ਖ਼ਤਰਾ",
    farmerIncome: "ਕਿਸਾਨ ਦੀ ਸ਼ੁੱਧ ਆਮਦਨ",
    foodProduced: "ਅਨਾਜ ਪੈਦਾਵਾਰ",
    impactVerdict: "ਧਰਤੀ ਹੇਠਲੇ ਪਾਣੀ ਨੂੰ ਬਚਾਉਂਦੇ ਹੋਏ ਕਿਸਾਨ ਦੀ ਮੌਸਮੀ ਆਮਦਨ ਵਿੱਚ +128% ਦਾ ਵਾਧਾ ਕਰਦਾ ਹੈ!"
  }
};
