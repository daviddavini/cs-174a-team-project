/*
========================================
THE JAVASCRIPT SOLAR SYSTEM SIMULATION
========================================
PART V: COMPLETE JAVASCRIPT ORRERY
----------------------------------------
Please visit the URL to learn more:
http://www.planetaryorbits.com/tutorial-javascript-orbit-simulation.html
----------------------------------------
*/

//You can verify this simulation with this NASA website:
//http://space.jpl.nasa.gov/
//NOTE: The First Point of Aries in the NASA simulation is due north!

var Planets = {
	fps:20, //Set desired framerate
	now:null,
	then:Date.now(),
	interval:null,
	delta:null,
	//TPS
	nowTPS:null,
	thenTPS:Date.now(),
	avgTPSCount:0,
	TPSCount:0,
	deltaTPS:0,
	//FPS
	nowFPS:null,
	thenFPS:Date.now(),
	avgFPSCount:0,
	FPSCount:0,
	deltaFPS:0,
	
	julianCenturyInJulianDays:36525,
	julianEpochJ2000:2451545.0,
	julianDate:null,
	current:null,
	newDate:null,
	DAY:null,
	MONTH:null,
	YEAR:null,
	
//ELEMENTS @ J2000: a, e, i, mean longitude (L), longitude of perihelion, longitude of ascending node
planetElements: [
	//MERCURY (0)
	[0.38709927,0.20563593,7.00497902,252.25032350,77.45779628,48.33076593],
	//VENUS (1)
	[0.72333566,0.00677672,3.39467605,181.97909950,131.60246718,76.67984255],
	//EARTH (2)
	[1.00000261,0.01671123,-0.00001531,100.46457166,102.93768193,0.0],
	//MARS (3)
	[1.52371034,0.09339410,1.84969142,-4.55343205,-23.94362959,49.55953891],
	//JUPITER (4)
	[5.20288700,0.04838624,1.30439695,34.39644051,14.72847983,100.47390909],
	//SATURN (5)
	[9.53667594,0.05386179,2.48599187,49.95424423,92.59887831,113.66242448],
	//URANUS (6)
	[19.18916464,0.04725744,0.77263783,313.23810451,170.95427630,74.01692503],
	//NEPTUNE (7)
	[30.06992276,0.00859048,1.77004347,-55.12002969,44.96476227,131.78422574]
],
	
//RATES: a, e, i, mean longitude (L), longitude of perihelion, longitude of ascending node
planetRates: [
	//MERCURY (0)
	[0.00000037,0.00001906,-0.00594749,149472.67411175,0.16047689,-0.1253408],
	//VENUS (1)
	[0.00000390,-0.00004107,-0.00078890,58517.81538729,0.00268329,-0.27769418],
	//EARTH (2)
	[0.00000562,-0.00004392,-0.01294668,35999.37244981,0.32327364,0.0],
	//MARS (3)
	[0.00001847,0.00007882,-0.00813131,19140.30268499,0.44441088,-0.29257343],
	//JUPITER (4)
	[-0.00011607,-0.00013253,-0.00183714,3034.74612775,0.21252668,0.20469106],
	//SATURN (5)
	[-0.00125060,-0.00050991,0.00193609,1222.49362201,-0.41897216,-0.28867794],
	//URANUS (6)
	[-0.00196176,-0.00004397,-0.00242939,428.48202785,0.40805281,0.04240589],
	//NEPTUNE (7)
	[0.00026291,0.00005105,0.00035372,218.45945325,-0.32241464,-0.00508664]
],
	
	orbitalElements:null,
	
	xMercury:null,
	yMercury:null,
	xVenus:null,
	yVenus:null,
	xEarth:null,
	yEarth:null,
	xMars:null,
	yMars:null,
	xJupiter:null,
	yJupiter:null,
	xSaturn:null,
	ySaturn:null,
	xUranus:null,
	yUranus:null,		
	xNeptune:null,
	yNeptune:null,			
	
	scale:50,
	
	//Divide AU multiplier by this number to fit it into  "orrery" style solar system (compressed scale)
	jupiterScaleDivider:2.5, 
	saturnScaleDivider:3.5,
	uranusScaleDivider:6.2,
	neptuneScaleDivider:8.7
}

function getJulianDate_Planets(Year,Month,Day){
	var inputDate = new Date(Year,Month,Math.floor(Day));
	var switchDate = new Date("1582","10","15");

	var isGregorianDate = inputDate >= switchDate;

	//Adjust if B.C.
	if(Year<0){
		Year++;
	}

	//Adjust if JAN or FEB
	if(Month==1||Month==2){
		Year = Year - 1;
		Month = Month + 12;
	}

	//Calculate A & B; ONLY if date is equal or after 1582-Oct-15
	var A = Math.floor(Year/100); //A
	var B = 2-A+Math.floor(A/4); //B
	
	//Ignore B if date is before 1582-Oct-15
	if(!isGregorianDate){B=0;}
					
	return ((Math.floor(365.25*Year)) + (Math.floor(30.6001*(Month+1))) + Day + 1720994.5 + B);			
}

function updateDate_Planets(increment){
	Planets.newDate = new Date(Planets.current.getFullYear(), Planets.current.getMonth(), Planets.current.getDate()+increment); //Set to today +1 day
	Planets.current = Planets.newDate;

	newdd = Planets.newDate.getDate();
	newmm = Planets.newDate.getMonth()+1; //January is 0!
	newyyyy = Planets.newDate.getFullYear();

	Planets.YEAR = newyyyy;
	Planets.MONTH = newmm;
	Planets.DAY = newdd;
	
	Planets.julianDate = getJulianDate_Planets(Planets.YEAR,Planets.MONTH,Planets.DAY);
	Planets.T = (Planets.julianDate-Planets.julianEpochJ2000)/Planets.julianCenturyInJulianDays; 
}

function plotPlanet_Planets(TGen,planetNumber){
	//--------------------------------------------------------------------------------------------
	//1.
	//ORBIT SIZE
	//AU (CONSTANT = DOESN'T CHANGE)
	aGen = Planets.planetElements[planetNumber][0] + (Planets.planetRates[planetNumber][0] * TGen);
	//2.
	//ORBIT SHAPE
	//ECCENTRICITY (CONSTANT = DOESN'T CHANGE)
	eGen = Planets.planetElements[planetNumber][1] + (Planets.planetRates[planetNumber][1] * TGen);
	//--------------------------------------------------------------------------------------------
	//3.
	//ORBIT ORIENTATION
	//ORBITAL INCLINATION (CONSTANT = DOESN'T CHANGE)
	iGen = Planets.planetElements[planetNumber][2] + (Planets.planetRates[planetNumber][2] * TGen);
	iGen = iGen%360;
	//4.
	//ORBIT ORIENTATION
	//LONG OF ASCENDING NODE (CONSTANT = DOESN'T CHANGE)
	WGen = Planets.planetElements[planetNumber][5] + (Planets.planetRates[planetNumber][5] * TGen);
	WGen = WGen%360;
	//5.
	//ORBIT ORIENTATION
	//LONGITUDE OF THE PERIHELION
	wGen = Planets.planetElements[planetNumber][4] + (Planets.planetRates[planetNumber][4] * TGen);
	wGen = wGen%360;
	if(wGen<0){wGen = 360+wGen;}	
	//--------------------------------------------------------------------------------------------
	//6.
	//ORBIT POSITION
	//MEAN LONGITUDE (DYNAMIC = CHANGES OVER TIME)
	LGen = Planets.planetElements[planetNumber][3] + (Planets.planetRates[planetNumber][3] * TGen);
	LGen = LGen%360;
	if(LGen<0){LGen = 360+LGen;}	
	
	
	//MEAN ANOMALY --> Use this to determine Perihelion (0 degrees = Perihelion of planet)
	MGen = LGen - (wGen);
	if(MGen<0){MGen=360+MGen;}

	//ECCENTRIC ANOMALY
	EGen = EccAnom_Planets(eGen,MGen,6);
	
	//ARGUMENT OF TRUE ANOMALY
	trueAnomalyArgGen = (Math.sqrt((1+eGen) / (1-eGen)))*(Math.tan(toRadians_Planets(EGen)/2));

	//TRUE ANOMALY (DYNAMIC = CHANGES OVER TIME)
	K = Math.PI/180.0; //Radian converter variable
	if(trueAnomalyArgGen<0){ 
		nGen = 2 * (Math.atan(trueAnomalyArgGen)/K+180); //ATAN = ARCTAN = INVERSE TAN
	}
	else{
		nGen = 2 * (Math.atan(trueAnomalyArgGen)/K)
	}
	//--------------------------------------------------------------------------------------------
	
	//CALCULATE RADIUS VECTOR
	rGen = aGen * (1 - (eGen * (Math.cos(toRadians_Planets(EGen)))));
	
	//TAKEN FROM: http://www.stargazing.net/kepler/ellipse.html
	//CREDIT: Keith Burnett
	//Used to determine Heliocentric Ecliptic Coordinates
	xGen = rGen *(Math.cos(toRadians_Planets(WGen)) * Math.cos(toRadians_Planets(nGen+wGen-WGen)) - Math.sin(toRadians_Planets(WGen)) * Math.sin(toRadians_Planets(nGen+wGen-WGen)) * Math.cos(toRadians_Planets(iGen)));
	yGen = rGen *(Math.sin(toRadians_Planets(WGen)) * Math.cos(toRadians_Planets(nGen+wGen-WGen)) + Math.cos(toRadians_Planets(WGen)) * Math.sin(toRadians_Planets(nGen+wGen-WGen)) * Math.cos(toRadians_Planets(iGen)));
	zGen = rGen *(Math.sin(toRadians_Planets(nGen+wGen-WGen))*Math.sin(toRadians_Planets(iGen)));

	return [xGen, yGen];
}

function EccAnom_Planets(ec,m,dp) {
	var pi=Math.PI, K=pi/180.0;
	var maxIter=30, i=0;
	var delta=Math.pow(10,-dp);
	var E, F;

	m=m/360.0;
	m=2.0*pi*(m-Math.floor(m));

	if (ec<0.8) E=m; else E=pi;

	F = E - ec*Math.sin(m) - m;

	while ((Math.abs(F)>delta) && (i<maxIter)) {
		E = E - F/(1.0-ec*Math.cos(E));
		F = E - ec*Math.sin(E) - m;
		i = i + 1;
	}

	E=E/K;

	return Math.round(E*Math.pow(10,dp))/Math.pow(10,dp);
}

function toRadians_Planets(deg){
	return deg * (Math.PI / 180);
}

function round_Planets(value, decimals) {
	return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}