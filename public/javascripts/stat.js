
$(document).ajaxError(function( event, jqxhr, settings, thrownError ){
    $("#message").append(jqxhr.responseText);
});


var graph2d;
var container = document.getElementById('visualization');
var groups = new vis.DataSet();
var dataset;

var ids = [];
var items = [];

$.get('/stats/getrecords').then(recArr=>{
    recArr = JSON.parse(recArr);

    recArr.forEach(record=>{
        if(ids.indexOf(record.idProd) == -1){
            groups.add({
                id: record.idProd,
                content: record.idProd+":"+record.nom,
                visible:false
            });
            ids.push(record.idProd);
        }

        items.push({
            x: record.createdAt,
            y: record.qt,
            group:record.idProd
        });
    });

    dataset = new vis.DataSet(items);
    var options = {
      start: Date.now()-7*24*60*60*1000,
      end: Date.now(),
      legend :true,
      moment: function(date) {
        return vis.moment(date).utcOffset('01:00');
      }
    };
    graph2d = new vis.Graph2d(container, dataset,groups, options);
  populateExternalLegend();
});



function populateExternalLegend() {
    var groupsData = groups.get();
    var legendDiv = document.getElementById("Legend");
    legendDiv.innerHTML = "";

    // get for all groups:
    for (var i = 0; i < groupsData.length; i++) {
      // create divs
      var containerDiv = document.createElement("div");
      var iconDiv = document.createElement("div");
      var descriptionDiv = document.createElement("div");

      // give divs classes and Ids where necessary
      containerDiv.className = 'legend-element-container';
      containerDiv.id = groupsData[i].id + "_legendContainer"
      iconDiv.className = "icon-container";
      descriptionDiv.className = "description-container";

      // get the legend for this group.
      var legend = graph2d.getLegend(groupsData[i].id,30,30);

      // append class to icon. All styling classes from the vis.css/vis-timeline-graph2d.min.css have been copied over into the head here to be able to style the
      // icons with the same classes if they are using the default ones.
      legend.icon.setAttributeNS(null, "class", "legend-icon");

      // append the legend to the corresponding divs
      iconDiv.appendChild(legend.icon);
      descriptionDiv.innerHTML = legend.label;

      // determine the order for left and right orientation
      if (legend.orientation == 'left') {
        descriptionDiv.style.textAlign = "left";
        containerDiv.appendChild(iconDiv);
        containerDiv.appendChild(descriptionDiv);
      }
      else {
        descriptionDiv.style.textAlign = "right";
        containerDiv.appendChild(descriptionDiv);
        containerDiv.appendChild(iconDiv);
      }

      // append to the legend container div
      legendDiv.appendChild(containerDiv);

      // bind click event to this legend element.
      containerDiv.onclick = toggleGraph.bind(this,groupsData[i].id);
    }
}

function toggleGraph(groupId) {
    // get the container that was clicked on.
    var container = document.getElementById(groupId + "_legendContainer")
    // if visible, hide
    if (graph2d.isGroupVisible(groupId) == true) {
      groups.update({id:groupId, visible:false});
      container.className = container.className + " hidden";
    }
    else { // if invisible, show
      groups.update({id:groupId, visible:true});
      container.className = container.className.replace("hidden","");
    }
  }
