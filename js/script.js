"use strict";
var project3 = (function() {
  var url = "https://people.rit.edu/dmgics/754/23/proxy.php";
  var map, marker;
  //  var url = "https://9f461485-4837-48af-9337-489e961c9205.mock.pstmn.io/";

  /*Lookup function that returns a list of possible organization types.*/
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
            opts +=
              "<option value=" +
              $("type", this).text() +
              ">" +
              $("type", this).text() +
              "</option>";
          });
          $("#orgType").html(opts);
        }
      }
    });
  }
  /*Returns organizations matching specified input criteria. */
  function showResults() {
    $.ajax({
      url: url,
      data: {
        path:
          "/Organizations?" +
          $("#search-form")
            .serialize()
            .replace("city=", "town=")
      },
      success: function(data) {
        // console.log(data);
        var output = "";
        $("#tableOutput").html(" ");
        // you should test for error first
        if ($(data).find("row").length === 0) {
          output += "No matches found";
        } else {
          // string template literal
          output +=
            `<table id="results-table" class="table table-bordered table-striped">
                                <thead class="thead-dark ">
                                    <tr>
                                        <th>Type</th>` +
            ($("#orgType").val() === "Physician" ? "<th>Physician</th>" : "") +
            `
                                        <th>OrgName</th>` +
            ($("#orgType").val() === "Physician"
              ? ""
              : "<th class='sorter-false filter-false'>Email</th>") +
            `
                                        <th>City</th>
                                        <th>State</th>
                                        <th>County</th>
                                        <th>Zip</th>
                                    </tr>
                                </thead>`;
          //var colspan = $("#orgType").val()=== "Physician"? 8:7;
          var colspan = 7;
          output +=
            `<tfoot>
                       <tr>
                        <th>Type</th>` +
            ($("#orgType").val() === "Physician" ? "<th>Physician</th>" : "") +
            `<th>OrgName</th>` +
            ($("#orgType").val() === "Physician" ? "" : "<th>Email</th>") +
            `
                        <th>City</th>
                        <th>State</th>
                        <th>County</th>
                        <th>Zip</th>
                      </tr>
                      <tr>
                        <th colspan=` +
            parseInt(colspan) +
            ` class="ts-pager">
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
            output +=
              "<tr data-organization-id=" +
              $(this)
                .find("OrganizationID")
                .text() +
              ">" +
              "<td>" +
              $(this)
                .find("type")
                .text() +
              `</td>` +
              ($("#orgType").val() === "Physician"
                ? "<td>" +
                  $("fName", this).text() +
                  " " +
                  $("mName", this).text() +
                  " " +
                  $("lName", this).text() +
                  "</td>"
                : "") +
              `<td>` +
              $("Name", this).text() +
              "</td>" +
              ($("#orgType").val() === "Physician"
                ? ""
                : "<td>" + $("Email", this).text() + "</td>") +
              "<td>" +
              $("city", this).text() +
              `</td><td>` +
              $("State", this).text() +
              `</td><td>` +
              $("CountyName", this).text() +
              `</td><td>` +
              $("zip", this).text() +
              "</td></tr>";
          });

          console.log("orgType");

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
                columns: ["primary", "secondary", "tertiary"],
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
              }
            })
            .tablesorterPager({
              container: $(".ts-pager"),
              cssGoto: ".pagenum",
              removeRows: false,
              output: "{startRow} - {endRow} / {filteredRows} ({totalRows})"
            });

          //Event-delegation
          $("#results-table tbody ").on("click", "td", function() {
            var selected_cell = $(this),
              selected_row = selected_cell.parent();

            if (selected_cell.index() == 1) {
              getTabs(selected_row.attr("data-organization-id"));
              getGeneralInfo(selected_row.attr("data-organization-id"));
              getLocationInfo(selected_row.attr("data-organization-id"));
              getTreatmentsInfo(selected_row.attr("data-organization-id"));
              getTrainingInfo(selected_row.attr("data-organization-id"));
              getAssetsInfo(selected_row.attr("data-organization-id"));
              getPhysiciansInfo(selected_row.attr("data-organization-id"));
              getPeopleInfo(selected_row.attr("data-organization-id"));
            }
          });
        }
      }
    });
  }
   /*A dictionary for defining an index for the posible tabs. The code was made
   to work with indexes at first but if a tab was missing the order of the results
   was affected. This dictionary assures the same index for the same tab type*/
  var tabIndex = {
    General: 0,
    Locations: 1,
    Treatment: 2,
    Training: 3,
    Facilities: 4,
    Physicians: 5,
    People: 6
  };

  /*Returns the tabs for a specific orgId. */
  function getTabs(orgId) {
    var path = "/Application/Tabs";
    var param = "orgId=" + orgId;

    function success(data, status) {
      var error_arr = $(data).find("error"),
        output = "",
        counter = 0;
      if (error_arr.length !== 0) {
        console.error("Errors: ", error_arr);
      } else {

        $("Tab", data).each(function() {
          output += "";

          var active = counter === 0 ? "active" : "",
            text = $(this).text(),
            index = tabIndex[text],
            id = "nav-" + index + "-tab",
            href = "nav-" + index,
            ariacontrols = "nav-" + index,
            ariaselected = counter === 0 ? "true" : "false";

          output +=
            "<a class='nav-item nav-link " +
            active +
            "' id='" +
            id +
            "' data-toggle='tab' href='#" +
            href +
            "' role='tab' aria-controls='" +
            ariacontrols +
            "' aria-selected='" +
            ariaselected +
            "'>" +
            text +
            "</a>";
          counter = counter + 1;
        });
        $("#nav-tab").append(output);
        $("#myModal").modal("show");
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
  /*Lookup function that returns a list of possible cities and populates the Cities
  selector*/
  function getCities(value) {
    var path = "/Cities",
      param = "state=" + value;

    function success(data, status) {
      //console.log("cities",data);
      var opts = "",
        error_arr = $(data).find("error");
      if (error_arr.length !== 0) {
        //TODO do something graceful here
        console.error("Errors: ", error_arr);
      } else {
        //TODO include a no cities found message.
        opts += "<option value=''>All Cities</option>";
        $("row", data).each(function() {
          opts +=
            "<option value=" +
            $("city", this).text() +
            ">" +
            $("city", this).text() +
            "</option>";
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
  /*Returns an object with the fields given  the data obtained from
  an ajax call and the list of fields. This solution can be better implemented
  using jQuery*/
  function makeFields(data) {
    var fields = {};

    function validatedFind(data, field) {
      var text = $(data).find(field);
      return text;
    }

    for (var i = 1, len = arguments.length + 1; i < len; i++) {
      fields[arguments[i]] = $(validatedFind(data, arguments[i])[0]).text();
    }
    return fields;
  }

  /*Returns general information about specified organization..*/
  function getGeneralInfo(orgId) {
    var path = "/" + orgId + "/General";

    function success(data, status) {
      // console.log(data);
      var output = "",
        error_arr = $(data).find("error");
      if (error_arr.length !== 0) {
        //TODO do something graceful here
        console.error("Errors: ", error_arr);
      } else {
        //TODO include a no cities found message.
        var fields = makeFields(
          data,
          "name",
          "email",
          "website",
          "description",
          "nummembers",
          "numcalls",
          "servicearea"
        );

        output =
          "<div class='tab-pane fade show active' id='nav-0' role='tabpanel' aria-labelledby='nav-0-tab'>" +
          "<p><span class='g-inf-lab'>Name: </span>" +
          fields.name +
          "</p>" +
          "<p><span class='g-inf-lab'>Email: </span>" +
          fields.email +
          "</p>" +
          "<p><span class='g-inf-lab'>Website: </span>" +
          fields.website +
          "</p>" +
          "<p><span class='g-inf-lab'>Description: </span>" +
          fields.description +
          "</p>" +
          "<p><span class='g-inf-lab'>Number of members: </span>" +
          fields.nummembers +
          "</p>" +
          "<p><span class='g-inf-lab'>Number of calls: </span>" +
          fields.numcalls +
          "</p>" +
          "<p><span class='g-inf-lab'>Service area: </span>" +
          fields.servicearea +
          "</p>" +
          "</div>";

        $("#nav-tabContent").append(output);
        $("#myModal").modal("show");
      }
    }

    $.ajax({
      type: "GET",
      async: true,
      cache: false,
      url: url,
      data: { path: path },
      dataType: "xml", //content type of response
      success: success
    });
  }

  /*Returns information regarding available treatment at the specified organization. */
  function getTreatmentsInfo(orgId) {
    var path = "/" + orgId + "/Treatments";

    function success(data, status) {
      var error_arr = $(data).find("error");
      if (error_arr.length !== 0) {
        // TODO: do something graceful
        console.error("Errors: ", error_arr);
      } else {
        // console.log("getTreatmentsInfo",data);
        var tableEle = $("<table></table>"),
          tableHeaderEle = $("<thead></thead>"),
          tableBodyEle = $("<tbody></tbody>"),
          tableRow = $("<tr></tr>"),
          tableCellHeader = $("<th></th>"),
          tableCell = $("<td></td>"),
          containerDiv = $("<div></div>");

        containerDiv.attr({
          class: "tab-pane fade",
          id: "nav-2",
          role: "tabpanel",
          "aria-labelledby": "nav-2-tab"
        });

        tableEle.addClass("table");

        tableHeaderEle.append(
          tableRow
            .clone()
            .append(
              tableCellHeader.clone().text("Type"),
              tableCellHeader.clone().text("Abbreviation")
            )
        );
        $("treatment", data).each(function() {
          tableBodyEle.append(
            tableRow
              .clone()
              .append(
                tableCell.clone().text($("type", this).text()),
                tableCell.clone().text($("abbreviation", this).text())
              )
          );
        });
        tableEle.append(tableHeaderEle, tableBodyEle);
        containerDiv.append(tableEle);
      }
      $("#nav-tabContent").append(containerDiv);
    }
    $.ajax({
      type: "GET",
      async: true,
      cache: false,
      url: url,
      data: { path: path },
      dataType: "xml", //content type of response
      success: success
    });
  }
  //Returns information regarding available training at the specified organization.
  function getTrainingInfo(orgId) {
    var path = "/" + orgId + "/Training";

    function success(data, status) {
      var error_arr = $(data).find("error");
      if (error_arr.length !== 0) {
        // TODO: do something graceful
        console.error("Errors: ", error_arr);
      } else {
        // console.log(data);
        var tableEle = $("<table></table>"),
          tableHeaderEle = $("<thead></thead>"),
          tableBodyEle = $("<tbody></tbody>"),
          tableRow = $("<tr></tr>"),
          tableCellHeader = $("<th></th>"),
          tableCell = $("<td></td>"),
          containerDiv = $("<div></div>");

        containerDiv.attr({
          class: "tab-pane fade",
          id: "nav-3",
          role: "tabpanel",
          "aria-labelledby": "nav-3-tab"
        });

        tableEle.addClass("table");

        tableHeaderEle.append(
          tableRow
            .clone()
            .append(
              tableCellHeader.clone().text("TypeID"),
              tableCellHeader.clone().text("Type"),
              tableCellHeader.clone().text("Abbreviation")
            )
        );
        $("training", data).each(function() {
          tableBodyEle.append(
            tableRow
              .clone()
              .append(
                tableCell.clone().text($("typeId", this).text()),
                tableCell.clone().text($("type", this).text()),
                tableCell.clone().text($("abbreviation", this).text())
              )
          );
        });

        tableEle.append(tableHeaderEle, tableBodyEle);
        containerDiv.append(tableEle);
      }
      $("#nav-tabContent").append(containerDiv);
    }
    $.ajax({
      type: "GET",
      async: true,
      cache: false,
      url: url,
      data: { path: path },
      dataType: "xml", //content type of response
      success: success
    });
  }
 /*Returns information regarding all physicians who have admitting privleges at the specified hospital.*/
  function getPhysiciansInfo(orgId) {
    var path = "/" + orgId + "/Physicians";

    function success(data, status) {
      var error_arr = $(data).find("error");
      if (error_arr.length !== 0) {
        // TODO: do something graceful
        console.error("Errors: ", error_arr);
      } else {
        // console.log(data);
        var tableEle = $("<table></table>"),
          tableHeaderEle = $("<thead></thead>"),
          tableBodyEle = $("<tbody></tbody>"),
          tableRow = $("<tr></tr>"),
          tableCellHeader = $("<th></th>"),
          tableCell = $("<td></td>"),
          containerDiv = $("<div></div>");

        containerDiv.attr({
          class: "tab-pane fade",
          id: "nav-5",
          role: "tabpanel",
          "aria-labelledby": "nav-5-tab"
        });

        tableEle.addClass("table");
        tableHeaderEle.append(
          tableRow
            .clone()
            .append(
              tableCellHeader.clone().text("Name"),
              tableCellHeader.clone().text("license"),
              tableCellHeader.clone().text("phone")
            )
        );
        $("physician", data).each(function() {
          tableBodyEle.append(
            tableRow
              .clone()
              .append(
                tableCell
                  .clone()
                  .text(
                    $("fName", this).text() +
                      " " +
                      $("mName", this).text() +
                      " " +
                      $("lName", this).text()
                  ),
                tableCell.clone().text($("license", this).text()),
                tableCell.clone().text($("phone", this).text())
              )
          );
        });

        tableEle.append(tableHeaderEle, tableBodyEle);
        containerDiv.append(tableEle);
        $("#nav-tabContent").append(containerDiv);
      }
    }
    $.ajax({
      type: "GET",
      async: true,
      cache: false,
      url: url,
      data: { path: path },
      dataType: "xml", //content type of response
      success: success
    });
  }
  /*Returns information regarding available facilities at the specified organization.*/
  function getAssetsInfo(orgId) {
    var path = "/" + orgId + "/Facilities";

    function success(data, status) {
      var error_arr = $(data).find("error");
      if (error_arr.length !== 0) {
        // TODO: do something graceful
        console.error("Errors: ", error_arr);
      } else {
        // console.log(data);
        var tableEle = $("<table></table>"),
          tableHeaderEle = $("<thead></thead>"),
          tableBodyEle = $("<tbody></tbody>"),
          tableRow = $("<tr></tr>"),
          tableCellHeader = $("<th></th>"),
          tableCell = $("<td></td>"),
          containerDiv = $("<div></div>");

        containerDiv.attr({
          class: "tab-pane fade",
          id: "nav-4",
          role: "tabpanel",
          "aria-labelledby": "nav-4-tab"
        });

        tableEle.addClass("table");

        tableHeaderEle.append(
          tableRow
            .clone()
            .append(
              tableCellHeader.clone().text("TypeID"),
              tableCellHeader.clone().text("Type"),
              tableCellHeader.clone().text("Quantity"),
              tableCellHeader.clone().text("Description")
            )
        );
        $("facility", data).each(function() {
          tableBodyEle.append(
            tableRow
              .clone()
              .append(
                tableCell.clone().text($("typeId", this).text()),
                tableCell.clone().text($("type", this).text()),
                tableCell.clone().text($("quantity", this).text()),
                tableCell.clone().text($("description", this).text())
              )
          );
        });

        tableEle.append(tableHeaderEle, tableBodyEle);
        containerDiv.append(tableEle);
      }
      $("#nav-tabContent").append(containerDiv);
    }
    $.ajax({
      type: "GET",
      async: true,
      cache: false,
      url: url,
      data: { path: path },
      dataType: "xml", //content type of response
      success: success
    });
  }
  /*Returns information regarding personnel associated with the specified organization. Each of the organization's locations is listed with its address. Within each location, personnel are listed.*/
  function getPeopleInfo(orgId) {
    var path = "/" + orgId + "/People";

    function success(data, status) {
      var error_arr = $(data).find("error");
      if (error_arr.length !== 0) {
        // TODO: do something graceful
        console.error("Errors: ", error_arr);
      } else {
        //  console.log(data);
        var tableEle = $("<table></table>"),
          tableHeaderEle = $("<thead></thead>"),
          tableBodyEle = $("<tbody></tbody>"),
          tableRow = $("<tr></tr>"),
          tableCellHeader = $("<th></th>"),
          tableCell = $("<td></td>"),
          containerDiv = $("<div></div>"),
          selectEle = $("<select></select>"),
          optionEle = $("<option></option>"),
          table,
          tableheader,
          tableBody;

        tableEle.addClass("table site-table");

        containerDiv.attr({
          class: "tab-pane fade",
          id: "nav-6",
          role: "tabpanel",
          "aria-labelledby": "nav-6-tab"
        });

        tableHeaderEle.append(
          tableRow.clone().append(
            tableCellHeader
              .clone()
              .attr({
                class: "people-site",
                colspan: 2
              })
              .text("Site")
          ),
          tableRow
            .clone()
            .append(
              tableCellHeader.clone().text("Name"),
              tableCellHeader.clone().text("Role")
            )
        );

        selectEle.attr("id", "site-select");

        $("site", data).each(function() {
          selectEle.append(
            optionEle
              .clone()
              .attr({
                siteId: $(this).attr("siteId"),
                siteType: $(this).attr("siteType")
              })
              .text($(this).attr("address"))
          );
          table = tableEle.clone();
          tableheader = tableHeaderEle.clone();
          tableBody = tableBodyEle.clone();

          table.attr({
            id: "table-site-" + $(this).attr("siteId")
          });

          $("person", this).each(function() {
            tableBody.append(
              tableRow
                .clone()
                .append(
                  tableCell
                    .clone()
                    .text(
                      $("fName", this).text() +
                        " " +
                        $("mName", this).text() +
                        " " +
                        $("lName", this).text()
                    ),
                  tableCell.clone().text($("role", this).text())
                )
            );
          });
          table.append(tableheader, tableBody);
          table.hide();
          containerDiv.append(table);
        });
        $(containerDiv)
          .find("table")
          .first()
          .show();
        containerDiv.prepend(selectEle);
        $("#nav-tabContent").append(containerDiv);
      }
    }
    $.ajax({
      type: "GET",
      async: true,
      cache: false,
      url: url,
      data: { path: path },
      dataType: "xml", //content type of response
      success: success
    });
  }
  /*Returns an object with the fields for the location given  the data obtained from
  an ajax call and the list of fields. This solution can be better implemented
  using jQuery*/
  function parselocations(data) {
    var locations = [],
      locationFields = [
        "type",
        "address1",
        "address2",
        "city",
        "state",
        "zip",
        "phone",
        "ttyphone",
        "fax",
        "latitude",
        "longitude",
        "countyId",
        "countyName",
        "siteId"
      ],
      locationFieldsLen = locationFields.length,
      locationsLen = parseInt(
        $(data)
          .find("count")
          .text()
      ),
      value;
    for (var i = 0; i < locationsLen; i++) {
      var location = {};
      for (var j = 0; j < locationFieldsLen; j++) {
        value = $($(data).find(locationFields[j])[i]).text();

        location[locationFields[j]] = value;
      }
      locations.push(location);
    }
    return locations;
  }
 /*Lookup function that returns a list of possible location types.*/
  function getLocationInfo(orgId) {
    var path = "/" + orgId + "/Locations";
    function success(data, status) {
      //  console.log(data);
      var output = "",
        error_arr = $(data).find("error");
      if (error_arr.length !== 0) {
        //TODO do something graceful here
      } else {
        //TODO include a no cities found message.
        var locations = parselocations(data);

        //console.log("location list",locations);
        output +=
          "<div class='tab-pane fade' id='nav-1' role='tabpanel' aria-labelledby='nav-1-tab'>";

        output += "<select id='locations'>";

        for (var i = 0; i < locations.length; i++) {
          output +=
            "<option data-type='" +
            locations[i]["type"] +
            "'> Locations: " +
            locations[i]["type"] +
            "</option>";
        }

        output += "</select><br/>";
        output += "<div class = 'row'>";

        for (var j = 0; j < locations.length; j++) {
          output +=
            "<div class='loc col-lg-6" +
            (j === 0
              ? " active' style='display: inline-block;'"
              : "' style='display: none;' ") +
            " id=loc-" +
            locations[j]["type"] +
            " data-type=" +
            locations[j]["type"] +
            ">" +
            "<p class='type'><span  class='g-inf-lab'>Type: </span>" +
            locations[j]["type"] +
            "</p>" +
            "<p class='address1'><span  class='g-inf-lab'>Address: </span>" +
            locations[j]["address1"] +
            "</p>" +
            "<p class='address2'><span  class='g-inf-lab'>Address2: </span>" +
            locations[j]["address2"] +
            "</p>" +
            "<p class='city'><span  class='g-inf-lab'>City: </span>" +
            locations[j]["city"] +
            "</p>" +
            "<p class='state'><span  class='g-inf-lab'>State: </span>" +
            locations[j]["state"] +
            "</p>" +
            "<p class='zip'><span  class='g-inf-lab'>Zip: </span>" +
            locations[j]["zip"] +
            "</p>" +
            "<p class='latitude'><span  class='g-inf-lab'>Lat: </span>" +
            locations[j]["latitude"] +
            "</p>" +
            "<p class='longitude'><span  class='g-inf-lab'>Lng: </span>" +
            locations[j]["longitude"] +
            "</p>" +
            "<p class='phone'><span  class='g-inf-lab'>Phone: </span>" +
            locations[j]["phone"] +
            "</p>" +
            "<p class='countyName'><span  class='g-inf-lab'>CountyName: </span>" +
            locations[j]["countyName"] +
            "</p>";
          output += "</div>";
        }

        output +=
          "<div class='col-lg-6' style='display: inline-block;' >" +
          "<div id='map'>Loading map..</div>";
        output += "</div>";
        output += "</div>";
        output += "</div><br/>"; //Closes outer div

        $("#nav-tabContent").append(output);
      }
    }

    $.ajax({
      type: "GET",
      async: true,
      cache: false,
      url: url,
      data: { path: path },
      dataType: "xml", //content type of response
      success: success
    });
  }

  return {
    init: function init() {
      //console.log("Test init");
      $(function() {
        //console.log($("#state"));
        $("#state").usStateSelector({ selected: "NY" });
        //add event listeners
        $("#btnSearch").bind("click", showResults);
        $("#state").bind("change", function(e) {
          getCities(this.value);
        });

        function clearNavContent() {
          $("#nav-tabContent").html("");
          $("#nav-tab").html("");
        }
        $("#myModal")
          .on("hidden.bs.modal", clearNavContent)
          .on("change", "#locations", function() {
            $(".loc")
              .css("display", "none")
              .removeClass("active");
            $("#loc-" + $("#locations option:selected").attr("data-type"))
              .css("display", "inline-block")
              .addClass("active");

            var longitudeText = $(".loc.active .longitude")
                .text()
                .replace("Lng: ", "")
                .trim(),
              latitudeText = $(".loc.active .latitude")
                .text()
                .replace("Lat: ", "")
                .trim();

            if (
              longitudeText !== "null" &&
              latitudeText !== "null" &&
              longitudeText !== "" &&
              latitudeText !== "" &&
              longitudeText &&
              latitudeText
            ) {
              var longitude = parseFloat(longitudeText);
              var latitude = parseFloat(latitudeText);
              map.setCenter({ lat: latitude, lng: longitude });
              marker.setPosition({ lat: latitude, lng: longitude });
              map.panTo({ lat: latitude, lng: longitude });
            }
          })
          .on("change", "#site-select", function() {
            //    console.log("option:selected", );
            $(".site-table").hide();
            $(
              "#table-site-" + $("option:selected", this).attr("siteId")
            ).show();
          });
        $(".plugin-tooltip").tooltipster({
          maxWidth: 300,
          side: "right",
          animation: "grow",
          theme: "tooltipster-borderless"
        });
        getOrgTypes();
        getCities($("#state").val());
        $("#text-resizer-controls li a").textresizer({
          target: ".textsize"
        });
        $(".typist")
          .typist({
            speed: 10,
            text: "Emergency Services Directory Project 2"
          })
          .typistStop();
      });
    },
    /*This methos sets the event on change for loading the map when the modol
    is shown*/
    initMap: function() {
      $("#myModal").on("show.bs.modal", function() {
        setTimeout(function() {
          var longitudeText = $(".loc.active .longitude")
              .text()
              .replace("Lng: ", "")
              .trim(),
            latitudeText = $(".loc.active .latitude")
              .text()
              .replace("Lat: ", "")
              .trim();

          if (
            longitudeText !== "null" &&
            latitudeText !== "null" &&
            longitudeText !== "" &&
            latitudeText !== "" &&
            longitudeText &&
            latitudeText
          ) {
            var longitude = parseFloat(longitudeText);
            var latitude = parseFloat(latitudeText);

            //  console.log('longitude: ',longitude,"latitude: ",latitude);

            map = new google.maps.Map(document.getElementById("map"), {
              center: { lat: latitude, lng: longitude },
              zoom: 15
            });

            marker = new google.maps.Marker({
              position: { lat: latitude, lng: longitude },
              map: map,
              title: "here"
            });
          } else {
            $("#map").html("No map information available");
          }
        }, 2000);
      });
    }
  };
})();

project3.init();
