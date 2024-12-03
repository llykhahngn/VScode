$("#document").ready(function () {
  // Chức năng 1: Đưa dữ liệu bản đồ lên web
  var format = "image/png";
  var bounds = [564182.125, 2317466.0, 564514.4375, 2318014.0];

  var vung = new ol.layer.Image({
    source: new ol.source.ImageWMS({
      ratio: 1,
      url: "http://localhost:8082/geoserver/CH1/wms",
      params: {
        FORMAT: format,
        VERSION: "1.1.0",
        STYLES: "",
        LAYERS: "CH1:camhoangdc_1",
      },
    }),
  });

  var duong = new ol.layer.Image({
    source: new ol.source.ImageWMS({
      ratio: 1,
      url: "http://localhost:8082/geoserver/CH1/wms",
      params: {
        FORMAT: format,
        VERSION: "1.1.0",
        STYLES: "",
        LAYERS: "CH1:camhoanggt_1",
      },
    }),
  });

  var diem = new ol.layer.Image({
    source: new ol.source.ImageWMS({
      ratio: 1,
      url: "http://localhost:8082/geoserver/CH1/wms",
      params: {
        FORMAT: format,
        VERSION: "1.1.0",
        STYLES: "",
        LAYERS: "CH1:camhoangtt_1",
      },
    }),
  });

  // Bài 5: tạo popup
  var container = document.getElementById("popup");
  var content = document.getElementById("popup-content");
  var closer = document.getElementById("popup-closer");

  var shouldUpdate = true;
  var center = [564182.125, 2317466];
  var zoom = 20.56631263565161;
  var rotation = 0;

  var overlay = new ol.Overlay({
    element: container,
    autoPan: true,
    autoPanAnimation: {
      duration: 250,
    },
  });

  var projection = new ol.proj.Projection({
    code: "EPSG:3405",
    units: "m",
    axisOrientation: "neu",
  });

  var view = new ol.View({
    projection: projection,
    center: center,
    zoom: zoom,
    rotation: rotation,
  });

  var map = new ol.Map({
    target: "map",
    layers: [vung, duong, diem],
    view: view,
    // Chức năng 5 thêm 1 dòng code
    overlays: [overlay],
    // --------------
  });

  map.getView().fit(bounds, map.getSize());

  // Chức năng 2: tạo chức năng hiện thị hoặc tắt hiển thị bản đồ trên web (tạo checkbox)
  $("#vung").change(function () {
    if ($("#vung").is(":checked")) {
      vung.setVisible(true);
    } else {
      vung.setVisible(false);
    }
  });

  $("#duong").change(function () {
    if ($("#duong").is(":checked")) {
      duong.setVisible(true);
    } else {
      duong.setVisible(false);
    }
  });

  $("#diem").change(function () {
    if ($("#diem").is(":checked")) {
      diem.setVisible(true);
    } else {
      diem.setVisible(false);
    }

    if (layer) {
      layer.setVisible($(this).is(":checked"));
    }
  });

  var highlightLayer;

  // Chức năng 3: Lấy thông tin thuộc tính (2 hoặc nhiều) của đối tượng bản đồ (dạng vùng) khi click chuột
  map.on("singleclick", function (evt) {
    var view = map.getView();
    var viewResolution = view.getResolution();
    var source = vung.getSource();
    var url = source.getFeatureInfoUrl(
      evt.coordinate,
      viewResolution,
      view.getProjection(),
      { INFO_FORMAT: "application/json", FEATURE_COUNT: 50 }
    );

    if (url) {
      $.ajax({
        type: "POST",
        url: url,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (n) {
          var content = "<table>";
          for (var i = 0; i < n.features.length; i++) {
            var feature = n.features[i];
            var featureAttr = feature.properties;
            content +=
              "<tr><td>Loại Đất:" +
              featureAttr["loaidat"] +
              "</td><td> Diện Tích:" +
              featureAttr["dientich"] +
              "</td></tr>";
          }
          content += "</table>";
          // ------------
          // Chức năng 5 (5.2)
          $("#popup-content").html(content);
          overlay.setPosition(evt.coordinate);
          $("#info").html(content);
          // -------------------------
          if (highlightLayer) {
            map.removeLayer(highlightLayer);
          }
          // Bài 4. Hiển thị đối tượng nổi bật được chọn vùng:camhoangdc
          var styles = {
            MultiPolygon: new ol.style.Style({
              stroke: new ol.style.Stroke({
                color: "yellow",
                width: 5,
              }),
            }),
          };
          var styleFunction = function (feature) {
            return styles[feature.getGeometry().getType()];
          };
          highlightLayer = new ol.layer.Vector({
            style: styleFunction,
          });
          map.addLayer(highlightLayer);
          var vectorSource = new ol.source.Vector({
            features: new ol.format.GeoJSON().readFeatures(n),
          });
          highlightLayer.setSource(vectorSource);
        },
      });
    } else {
      console.error("Source is not an instance of ol.source.ImageWMS");
    }
  });

  // Bài 5. Tạo cửa sổ hiển thị thuộc tính của đối tượng trong bản đồ

  closer.onclick = function () {
    overlay.setPosition(undefined);
    closer.blur();
    return false;
  };

  window.moveMap = function (x, y) {
    let coordinate = ol.proj.fromLonLat([x, y], projection);

    view.animate({
      center: coordinate,
      duration: 2000,
      zoom: 20,
    });
  };
});
