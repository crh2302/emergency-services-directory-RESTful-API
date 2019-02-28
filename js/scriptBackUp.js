"use strict";
var url = "https://people.rit.edu/dmgics/754/23/proxy.php";

/*TODO*/
function getOrgTypes() {
  $.ajax({
    type: "GET", // HTTP method, could also be "POST"
    async: true, // request should be non blocking
    cache: false, // store the response data
    url: url,
    data: { path: "/OrgTypes" },
    dataType: "xml", //content type of response
    success: function(data, status) {
      // console.log(data);
      var opts = "";
      if ($(data).find("error").length !== 0) {
        // do something graceful here
      } else {
        opts += "<option value=''>All Organization Types</option>";
        $("row", data).each(function() {
          opts += "<option value=''>" + $("type", this).text() + "</option>";
        });
        $("#orgType").html(opts);
      }
    }
  });
}
/*TODO*/
function showResults() {
  $.ajax({
    url: url,
    data: { path: "/Organizations?" + $("#search-form").serialize() },
    success: function(data) {
      // console.log(data);
      var output = "";
      $("#tableOutput").html(" ");
      // you should test for error first
      if ($(data).find("row").length === 0) {
        output += "No matches found";
      } else {
        // string template literal
        output += `<table id="results-table" class="table table-bordered table-striped">
                              <thead class="thead-dark">
                                  <tr>
                                      <th>Type</th>
                                      <th>Name</th>
                                      <th class="sorter-false filter-false">Email</th>
                                      <th>City</th>
                                      <th>State</th>
                                      <th>County</th>
                                      <th>Zip</th>
                                  </tr>
                              </thead>`;
        output += `<tfoot>
                     <tr>
                      <th>Type</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>City</th>
                      <th>State</th>
                      <th>County</th>
                      <th>Zip</th>
                    </tr>
                    <tr>
                      <th colspan="7" class="ts-pager">
                        <div class="form-inline">
                          <div class="btn-group btn-group-sm mx-1" role="group">
                            <button type="button" class="btn btn-secondary first" title="first">⇤</button>
                            <button type="button" class="btn btn-secondary prev" title="previous">←</button>
                          </div>
                          <span class="pagedisplay"></span>
                          <div class="btn-group btn-group-sm mx-1" role="group">
                            <button type="button" class="btn btn-secondary next" title="next">→</button>
                            <button type="button" class="btn btn-secondary last" title="last">⇥</button>
                            <select class="form-control-sm custom-select px-1 pagesize" title="Select page size">
                              <option value="5">5</option>
                              <option selected="selected" value="10">10</option>
                              <option value="20">20</option>
                              <option value="30">30</option>
                              <option value="all">All Rows</option>
                            </select>
                            <select class="form-control-sm custom-select px-4 mx-1 pagenum" title="Select page number"></select>
                          </div>
                        </div>
                      </th>
                    </tr>
                  </tfoot>`;


        output += "<tbody>";
        $("row", data).each(function() {
        output +="<tr data-organization-id=" + $(this).find('OrganizationID').text() + ">" +
                       "<td>" +  $(this).find("type").text() + `</td>
                        <td>` + $("Name", this).text() + `</td>
                        <td>` + $("Email", this).text() + `</td>
                        <td>` + $("city", this).text() + `</td>
                        <td>` + $("State", this).text() + `</td>
                        <td>` + $("CountyName", this).text() + `</td>
                        <td>` + $("zip", this).text() + `</td>
                   </tr>`;
        });

        output += "</tbody>";
        output += "</table>";
        $("#tableOutput").html(output);
        $("#results-table")
          .tablesorter({
            theme: "bootstrap",
            widthFixed: true,
            widgets: ["filter", "columns", "zebra"],
            widgetOptions: {
              zebra: ["even", "odd"],
                columns: [ "primary", "secondary", "tertiary" ],
              filter_reset: ".reset",
              filter_cssFilter: [
                "form-control",
                "form-control",
                "form-control custom-select",
                "form-control",
                "form-control",
                "form-control",
                "form-control"
              ]
            }//,
            // headers: {
            //   2: { sorter: false }
            // }
          })
          .tablesorterPager({
            container: $(".ts-pager"),
            cssGoto: ".pagenum",
            removeRows: false,
            output: "{startRow} - {endRow} / {filteredRows} ({totalRows})"
          });

          //Event-delegation
          $( "#results-table tbody " ).on( "click", "td", function() {
            var selected_cell = $(this),
                selected_row = selected_cell.parent();


            console.log(selected_cell.index());
            if (selected_cell.index() == 1) {
              // $('#modal-body-header').html("");
              // $('#modal-body-content').html("");
              console.log("selected text:",selected_cell.text());
              console.log("organization-id",selected_row.attr("data-organization-id"));


              getTabs(selected_row.attr("data-organization-id"));
              getGeneralInfo(selected_row.attr("data-organization-id"));
              getLocationInfo(selected_row.attr("data-organization-id"));

            }
          });
      }
    }
  });
}

/*TODO*/
function getTabs(orgId) {
  var path = "/Application/Tabs";
  var param = "orgId=" + orgId;

  function success(data, status) {
    var error_arr = $(data).find("error"),
        output = "",
        counter = 0;
    if (error_arr.length !== 0) {
      //TODO do something graceful here
      console.error("Errors: ", error_arr);

    } else {
      //TODO include a no cities found message.


      $("Tab", data).each(function() {
        output += ""
         //<a class='nav-item nav-link active' id='nav-home-tab' data-toggle='tab' href='#nav-home' role='tab' aria-controls='nav-home' aria-selected='true'>Home</a>

         var active = (counter === 0 ? "active":""),
             id ="nav-" + counter +"-tab",
             href="nav-" + counter,
             ariacontrols= "nav-" + counter,
             ariaselected= (counter === 0 ? "true":"false"),
             text= $(this).text() ;

         output += "<a class='nav-item nav-link " + active +
                  "' id='" + id +
                  "' data-toggle='tab' href='#" + href +
                  "' role='tab' aria-controls='" + ariacontrols +
                  "' aria-selected='" + ariaselected+"'>" +
                  text+ "</a>";
         counter = counter + 1;

      });

     $('#nav-tab').append(output);

     // <nav>
     //   <div class="nav nav-tabs" id="nav-tab" role="tablist">
     //     <a class="nav-item nav-link active" id="nav-home-tab" data-toggle="tab" href="#nav-home" role="tab" aria-controls="nav-home" aria-selected="true">Home</a>
     //     <a class="nav-item nav-link" id="nav-profile-tab" data-toggle="tab" href="#nav-profile" role="tab" aria-controls="nav-profile" aria-selected="false">Profile</a>
     //     <a class="nav-item nav-link" id="nav-contact-tab" data-toggle="tab" href="#nav-contact" role="tab" aria-controls="nav-contact" aria-selected="false">Contact</a>
     //   </div>
     // </nav>
     // <div class="tab-content" id="nav-tabContent">
     //   <div class="tab-pane fade show active" id="nav-home" role="tabpanel" aria-labelledby="nav-home-tab">Test 1</div>
     //   <div class="tab-pane fade" id="nav-profile" role="tabpanel" aria-labelledby="nav-profile-tab">Test 2</div>
     //   <div class="tab-pane fade" id="nav-contact" role="tabpanel" aria-labelledby="nav-contact-tab">Test 3</div>
     // </div>

    }
  }

  $.ajax({
    type: "GET",
    async: true,
    cache: false,
    url: url,
    data: { path: path + "?" + param },
    dataType: "xml", //content type of response
    success: success
  });
}
/*TODO*/
function getCities(value) {
  var path = "/Cities",
      param = "state=" + value;

  function success(data, status) {
    console.log(data);
    var opts = "",
        error_arr = $(data).find("error");
    if (error_arr.length !== 0) {
      //TODO do something graceful here
      console.error("Errors: ", error_arr);
    } else {
      //TODO include a no cities found message.
      opts += "<option value=''>All Cities</option>";
      $("row", data).each(function() {
        opts += "<option value=''>" + $("city", this).text() + "</option>";
      });
      $("#city").html(opts);
    }
  }

  $.ajax({
    type: "GET",
    async: true,
    cache: false,
    url: url,
    data: { path: path + "?" + param },
    dataType: "xml", //content type of response
    success: success
  });
}

function makeFields(data) {
  var fields ={};

  function validatedFind(data, field) {
    var text = $(data).find(field);
    return text;
  }

  for (var i = 1, len = arguments.length+1; i < len; i++) {
    fields[arguments[i]] = $(validatedFind(data,arguments[i])[0]).text();
  }
  return fields;
}

/*Returns general information about specified organization. Access is via GET.*/
function getGeneralInfo(orgId) {
  var path = "/" + orgId + "/General";

  function success(data, status) {
    console.log(data);
    var output = "",
        error_arr = $(data).find("error");
    if (error_arr.length !== 0) {
      //TODO do something graceful here
      console.error("Errors: ", error_arr);
    } else {
      //TODO include a no cities found message.
      var fields = makeFields(data,"name","email","website","description",
                              "nummembers","numcalls","servicearea");

       output =  "<div class='tab-pane fade show active' id='nav-0' role='tabpanel' aria-labelledby='nav-0-tab'>" +
                   "<p><span class='g-inf-lab'>Name: </span>" + fields.name + "</p>" +
                   "<p><span class='g-inf-lab'>Email: </span>" + fields.email + "</p>" +
                   "<p><span class='g-inf-lab'>Website: </span>" + fields.website + "</p>" +
                   "<p><span class='g-inf-lab'>Description: </span>" + fields.description + "</p>" +
                   "<p><span class='g-inf-lab'>Number of members: </span>" + fields.nummembers + "</p>" +
                   "<p><span class='g-inf-lab'>Number of calls: </span>" + fields.numcalls+ "</p>" +
                   "<p><span class='g-inf-lab'>Service area: </span>" + fields.servicearea + "</p>"+
                 "</div>";

      console.log(output);
      // TODO: Change Tab0 to a more meaningful name
       $('#nav-tabContent').append(output);
       $('#myModal').modal('show');

       // <nav>
       //   <div class="nav nav-tabs" id="nav-tab" role="tablist">
       //     <a class="nav-item nav-link active" id="nav-home-tab" data-toggle="tab" href="#nav-home" role="tab" aria-controls="nav-home" aria-selected="true">Home</a>
       //     <a class="nav-item nav-link" id="nav-profile-tab" data-toggle="tab" href="#nav-profile" role="tab" aria-controls="nav-profile" aria-selected="false">Profile</a>
       //     <a class="nav-item nav-link" id="nav-contact-tab" data-toggle="tab" href="#nav-contact" role="tab" aria-controls="nav-contact" aria-selected="false">Contact</a>
       //   </div>
       // </nav>
       // <div class="tab-content" id="nav-tabContent">
       //   <div class="tab-pane fade show active" id="nav-home" role="tabpanel" aria-labelledby="nav-home-tab">Test 1</div>
       //   <div class="tab-pane fade" id="nav-profile" role="tabpanel" aria-labelledby="nav-profile-tab">Test 2</div>
       //   <div class="tab-pane fade" id="nav-contact" role="tabpanel" aria-labelledby="nav-contact-tab">Test 3</div>
       // </div>
    }
  }

  $.ajax({
    type: "GET",
    async: true,
    cache: false,
    url: url,
    data: { path: path},
    dataType: "xml", //content type of response
    success: success
  });

}

function getAssetsInfo() {

}

function getTreatmentsInfo() {

}

function parselocations(data) {
  var locations =[],
      locationFields = ["type","address1","address2","city",
                               "state","zip","phone","ttyphone","fax","latitude",
                               "longitude","countyId","countyName","siteId"],
      locationFieldsLen = locationFields.length,
      locationsLen = parseInt($(data).find("count").text()),
      value;
      for (var i = 0; i < locationsLen; i++) {
        var location = {dos:"DOS"};
        for (var j = 0; j < locationFieldsLen; j++) {
          value = $($(data).find(locationFields[j])[i]).text();
          location[locationFields[j]]=value;
        }
        locations.push(location)
      }
     return locations;
}

function getLocationInfo(orgId) {
  var path = "/" + orgId + "/Locations";

  console.log('inside getLocationInfo');

  function success(data, status) {
    console.log('inside success');
    console.log(data);
    var output = "",
        error_arr = $(data).find("error");
    if (error_arr.length !== 0) {
      //TODO do something graceful here
    } else {
      //TODO include a no cities found message.
      var locations = parselocations(data);
      //console.log("location list",locations);
      output+= "<div class='row tab-pane fade' id='nav-1' role='tabpanel' aria-labelledby='nav-1-tab'>";

      output+= "<select id='locations'>";

      for (var i = 0; i < locations.length; i++) {
        output+= "<option data-type='"+ locations[i]['type']+ "'> Locations: " +
                                    locations[i]['type']+ "</option>";
      }

      output+= "</select><br/>";


      for (var j = 0; j < locations.length; j++) {
        output+=  "<div class='loc col-lg-12'" + ( j===0 ?" style='display: none;'":" style='display: inline-block;' ") + " id=loc-" +locations[j]['type']+ ">"+
                    "<div class='loc-content col-lg-6'  style='display: inline-block;' >"+
                      "<p><span class='g-inf-lab'>Type: </span>" + locations[j]['type'] + "</p>" +
                      "<p><span class='g-inf-lab'>Address: </span>" + locations[j]['address1'] + "</p>" +
                      "<p><span class='g-inf-lab'>Address2: </span>" + locations[j]['address2'] + "</p>" +
                      "<p><span class='g-inf-lab'>City: </span>" + locations[j]['city'] + "</p>" +
                      "<p><span class='g-inf-lab'>State: </span>" + locations[j]['state'] + "</p>" +
                      "<p><span class='g-inf-lab'>Zip: </span>" + locations[j]['zip'] + "</p>" +
                      "<p><span class='g-inf-lab'>Phone: </span>" + locations[j]['phone'] + "</p>" +
                      "<p><span class='g-inf-lab'>CountyName: </span>" + locations[j]['countyName'] + "</p>";

                    output+= "</div>";
                    output+= "<div class='col-lg-6' style='display: inline-block;' >" +
                    "<div id='map'></div>"
                    output+= "</div>";
                  output+= "</div>";
      }




      output+= "</div><br/>";//Closes outer div
       $('#nav-tabContent').append(output);

      // console.log(output);
      // TODO: Change Tab0 to a more meaningful name
      // $('#tabs-content').html(output);
      // $('#myModal').modal('show');
    }
  }

  $.ajax({
    type: "GET",
    async: true,
    cache: false,
    url: url,
    data: { path: path},
    dataType: "xml", //content type of response
    success: success
  });
}

function getTrainingInfo() {

}

function getEquipmentInfo() {

}

function getPeopleInfo() {

}


function getTreatments() {

}

function getTraining() {

}

function getEquipment() {

}


function getFacilities() {

}
function getLocationTypes() {

}
function getContactTypes() {

}
function getPhysiciansInfo() {

}

$(function() {
  //add event listeners
  $("#btnSearch").bind("click", showResults);
  $("#state").bind("change", function(e) {
    getCities(this.value);
  });

  function clearNavContent() {
    $('#nav-tabContent').html("");
    $('#nav-tab').html("");
  }

  $("#myModal").on("hidden.bs.modal", clearNavContent)
  .on("change", "#locations",function () {
    $(".loc").css('display','none')
    $("#loc-" +$("#locations option:selected").attr("data-type")).css('display','inline-block')
    //css('display': 'inline-block'))
  })
  getOrgTypes();
  getCities($("#state").val());


});
