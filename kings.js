/*    
 * author: Jakob Sonnberger
 * company: DDH
 * purpose: Visualizing the CHIGC line of kings as Barchart
 * last update: 10/2026
 */

fetch('kings.json')
    .then(result => result.json())
    .then(resultJSON => {
        createChart(resultJSON);
        for (const country of Object.keys(resultJSON)) {
            makeTable(resultJSON, country);
        }
    });

//create the chart
function createChart(myJSON) {
	
	//chart dimensions
    const width = 800;
	const height = 400;

    //calculate total years
    let totalYears = d3.sum(myJSON.juda.map((d, i) => d.years));

    //create svg
	let mySVG = d3.select('#myChart')
		.append('svg')
        .attr('viewBox',[0, 0, width, height]);
    
    //band scaling for x-Axis
    let x = d3.scaleLinear()
        .domain([0, totalYears])
        .range([0,width-100]);

    //create x-Axis
    mySVG
       .append('g')
            .attr('transform', `translate(0, 300)`)
            .call(d3.axisBottom(x))
            .selectAll('text')
                .attr('font-size', '0.6em')
                .attr('text-anchor', 'start')
    
    //create rects for juda
	mySVG
        .append('g')
            .selectAll('rect')
            .data(myJSON.juda)
            .join('rect')
                .attr('fill', (item, index) => item.name.startsWith('No King') ? 'lightgray' : index % 2 === 0 ? 'orange' : 'darkorange')
    			.attr('x', (item, index) => x(d3.sum(myJSON.juda.slice(0, index), x => x.years)))
    			.attr('y', (item, index) => item.years > 1 ? 50 : 55)
    			.attr('height', 50)
    			.attr('width', (item, index) => x(item.years))
    			.on('mouseover', myMouseover)
                .on('mousemove', (event, d) => myMousemove(event, `${d.name} [${d.sources.wiki}]`))
                .on('mouseleave', myMouseleave);

    //create texts for juda
	mySVG
        .append('g')
            .selectAll('text')
            .data(myJSON.juda)
            .join('text')
    			.attr('x', (item, index) => x(d3.sum(myJSON.juda.slice(0, index), x => x.years) + item.years / 2))
    			.attr('y', 110)
    			.attr('font-size', '0.4em')
                .attr("font-style", "italic")
                .attr('font-weight', (item, index) => item.text ? 'bold' : 'normal')
                .text((item, index) => item.years > 1 ? item.name : "")
                .attr('transform',(item, index) => `rotate(30, ${x(d3.sum(myJSON.juda.slice(0, index), x => x.years) + item.years / 2)}, 110)`);
    
    //create label for israel
    mySVG
        .append('g')
        .append('text')
            .attr('x', 0)
            .attr('y', 40)
            .attr('font-size', '1.2em')
            .text('Juda');

    //create rects for israel
	mySVG
        .append('g')
            .selectAll('rect')
            .data(myJSON.israel)
            .join('rect')
                .attr('fill', (item, index) => item.name.startsWith('No King') ? 'lightgray' : index % 2 === 0 ? 'cornflowerblue' : 'royalblue')
    			.attr('x', (item, index) => x(d3.sum(myJSON.israel.slice(0, index), x => x.years)))
    			.attr('y', (item, index) => item.years > 1 ? 200 : 205)
    			.attr('height', 50)
    			.attr('width', (item, index) => x(item.years))
    			.on('mouseover', myMouseover)
                .on('mousemove', (event, d) => myMousemove(event, `${d.name} [${d.sources.wiki}]`))
                .on('mouseleave', myMouseleave);

    //create rects for < 0.25 years for israel
	mySVG
        .append('g')
            .selectAll('rect')
            .data(myJSON.israel)
            .join('rect')
                .attr('fill', (item, index) => index % 2 === 0 ? 'cornflowerblue' : 'royalblue')
    			.attr('x', (item, index) => x(d3.sum(myJSON.israel.slice(0, index), x => x.years)))
    			.attr('y', (item, index) => 205)
    			.attr('height', 50)
    			.attr('width', (item, index) => item.years < 0.25 ? 0.5 : 0)
    			.on('mouseover', myMouseover)
                .on('mousemove', (event, d) => myMousemove(event, `${d.name} [${d.sources.wiki}]`))
                .on('mouseleave', myMouseleave);

    //create texts for israel
	mySVG
        .append('g')
            .selectAll('text')
            .data(myJSON.israel)
            .join('text')
    			.attr('x', (item, index) => x(d3.sum(myJSON.israel.slice(0, index), x => x.years) + item.years / 2))
    			.attr('y', (item, index) => item.years > 1 ? 260 : 265)
    			.attr('font-size', '0.4em')
                .attr("font-style", "italic")
                .attr('font-weight', (item, index) => item.text ? 'bold' : 'normal')
                .text((item, index) => item.years > 1 ? item.name : "")
                .attr('transform',(item, index) => `rotate(30, ${x(d3.sum(myJSON.israel.slice(0, index), x => x.years) + item.years / 2)}, 260)`);
    
    //create label for israel
    mySVG
        .append('g')
        .append('text')
            .attr('x', 0)
            .attr('y', 190)
            .attr('font-size', '1.2em')
            .text('Israel');

    //--- Tooltips ----------------------------------------------------------------------------------------------------------------

    //create (invisible) div for tooltips
    let myTooltip = d3.select('#myChart')
        .append('div')
            .style("position", "absolute")
            .style('display', 'none')
            .attr('class', 'myTooltip')
            .style('max-width', '300px')
            .style('background-color', 'FloralWhite')
            .style('font-size', '1em' )
            .style('font-family', 'Calibri, sans-serif' )
            .style('padding', '10px');
            
    function myMouseover() {
            myTooltip
                .style('display', 'block');
            d3.select(this)
                .style('stroke', 'black')
                .style('opacity', 0.5);
          };
          
    //set tooltip text & position (relative to pointer)
    function myMousemove(myEvent, myTooltipText) {
        myTooltip
            .text(myTooltipText)
            .style('left', (myEvent.layerX + 'px'))
            .style('top', (myEvent.layerY + 20 + 'px'))
    };
    
    function myMouseleave() {
        myTooltip
            .style('display', 'none');
        d3.select(this)
            .style('stroke', 'none')
            .style('opacity', 1);
    };
};

function makeTable(myJSON, country) {
    const myDataset = myJSON[country];
    const table = document.getElementById(`${country}Table`);
    const thead = table.querySelector("thead");
    const tbody = table.querySelector("tbody");
    const headRow = makeMe("tr", thead);
    makeMe("th", headRow, "king");
    for (const key of Object.keys(myDataset[0].sources)) {
        makeMe("th", headRow, key);
    };
    for (const king of myDataset) {
        const row = makeMe("tr", tbody);
        const kingCell = makeMe("td", row, buildLink(king.name, `https://gams.uni-graz.at/archive/objects/query:chigc.thirdlayer/methods/sdef:Query/get?params=$1|${king.id}`));
        if (king.text) {
            kingCell.title = king.text;
            kingCell.style.fontWeight = "bold";
            kingCell.style.cursor = "help";
        }
        const wikiReign = king.sources.wiki;
        for (const value of Object.values(king.sources)) {
            const cell = makeMe("td", row, value);
            if (value != wikiReign) {
                cell.style.backgroundColor = "orangeRed";
            }
        }
    };
};

/* ################################## AUX functions ############################ */

//create and append an html element, 'element_content', 'element_class' and 'element_id' are optional
function makeMe(element, parentElement, element_content, element_class, element_id){
    element = document.createElement(element)
    parentElement.appendChild(element);
    if(element_content){element.innerHTML = element_content};
	if(element_class){element.className = element_class}
    if(element_id){element.id = element_id}
    return element;
};

//returns a simple HTML link from text and uri
function buildLink(text, uri){
    return `<a target='_blank' href='${uri}'>${text}</a>`
};