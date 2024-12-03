<?php
include('connection.php');
if(!$conn) {
    die("Connection failed: ".preg_last_error());
}
if (isset($_GET['loaidat'])) {
    $loaidat = strtolower($_GET['loaidat']);

    $query = "select *, st_x(ST_Centroid(geom)) as x, st_y(ST_Centroid(geom)) as y FROM public.camhoangdc_1 WHERE LOWER(loaidat) LIKE '%$loaidat%'";
    $result = pg_query($conn, $query);

    if (pg_num_rows($result) > 0) {
        while ($row = pg_fetch_row($result, null, PGSQL_ASSOC)) {
            $x = $row["x"];
            $y = $row["y"];

            $link = "<a href='#' onclick='window.moveMap($x, $y); return true;' class='link-redirect'>Xem vị trí</a>";

            print("Loại đất: " . $row['loaidat'] . " | Diện tích: " . $row['dientich'] . " | " . $link . "</br>");
        }
    } else {
        print("NOT FOUND");
    }
} else {
    print("NOT FOUND");
}

pg_close($conn);
?>
