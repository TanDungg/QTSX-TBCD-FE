import { DownloadOutlined } from "@ant-design/icons";
import { Button, Card, Row, Col, DatePicker, Divider } from "antd";
import { map, isEmpty } from "lodash";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions/Common";
import { exportExcel, getDateNow, reDataForTable } from "src/util/Common";
import {
  EditableTableRow,
  Table,
  Select,
  Toolbar,
} from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";
import {
  convertObjectToUrlParams,
  getTokenInfo,
  getLocalStorage,
} from "src/util/Common";
import moment from "moment";

const { RangePicker } = DatePicker;
const { EditableRow, EditableCell } = EditableTableRow;

function SoSanhDinhMuc({ permission, history, match }) {
  const dispatch = useDispatch();
  const { loading } = useSelector(({ common }) => common).toJS();
  const INFO = { ...getLocalStorage("menu"), user_Id: getTokenInfo().id };
  const [Data, setData] = useState([]);
  const [DataXuat, setDataXuat] = useState([]);
  const [ListPhongBan, setListPhongBan] = useState([]);
  const [PhongBan, setPhongBan] = useState(null);
  const [ListSanPham, setListSanPham] = useState([]);
  const [SanPham, setSanPham] = useState(null);
  const [TuNgay, setTuNgay] = useState(getDateNow(-7));
  const [DenNgay, setDenNgay] = useState(getDateNow());

  useEffect(() => {
    if (permission && permission.view) {
      getXuong();
    } else if ((permission && !permission.view) || permission === undefined) {
      history.push("/home");
    }
    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getListData = (PhongBan_Id, SanPham_Id, TuNgay, DenNgay) => {
    let param = convertObjectToUrlParams({
      PhongBan_Id,
      SanPham_Id,
      TuNgay,
      DenNgay,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_BaoCao/bao-cao-so-sanh-dinh-muc?${param}`,
          "GET",
          null,
          "DETAIL",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res && res.data) {
          setData(res.data.list_ChiTiets);
        } else {
          setData([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getXuong = () => {
    const params = convertObjectToUrlParams({
      page: -1,
      donviid: INFO.donVi_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `PhongBan?${params}`,
          "GET",
          null,
          "DETAIL",
          "",
          resolve,
          reject
        )
      );
    }).then((res) => {
      if (res && res.data) {
        const xuong = [];
        res.data.forEach((x) => {
          if (x.tenPhongBan.toLowerCase().includes("xưởng")) {
            xuong.push(x);
          }
        });
        setListPhongBan(xuong);
        setPhongBan(xuong[0].id);
        getListSanPham(xuong[0].id, TuNgay, DenNgay);
        getListData(xuong[0].id, null, TuNgay, DenNgay);
      } else {
        setListPhongBan([]);
      }
    });
  };

  const getListSanPham = (PhongBan_Id, TuNgay, DenNgay) => {
    let param = convertObjectToUrlParams({
      PhongBan_Id,
      TuNgay,
      DenNgay,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_BaoCao/san-pham-ke-hoach-by-phong-ban?${param}`,
          "GET",
          null,
          "DETAIL",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res && res.data) {
          setListSanPham(res.data);
        } else {
          setListSanPham([]);
        }
      })
      .catch((error) => console.error(error));
  };

  function removeDuplicates(arr) {
    const uniqueObjects = [];
    arr.forEach((obj) => {
      const isDuplicate = uniqueObjects.some((item) => {
        return item.text === obj.text && item.value === obj.value;
      });
      if (!isDuplicate) {
        uniqueObjects.push(obj);
      }
    });
    return uniqueObjects;
  }

  let colValues = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      width: 50,
      align: "center",
    },
    {
      title: "Mã vật tư",
      dataIndex: "maVatTu",
      key: "maVatTu",
      align: "center",
      filters: removeDuplicates(
        map(Data, (d) => {
          return {
            text: d.maVatTu,
            value: d.maVatTu,
          };
        })
      ),
      onFilter: (value, record) => record.maVatTu.includes(value),
      filterSearch: true,
    },
    {
      title: "Tên vật tư",
      dataIndex: "tenVatTu",
      key: "tenVatTu",
      align: "center",
      filters: removeDuplicates(
        map(Data, (d) => {
          return {
            text: d.tenVatTu,
            value: d.tenVatTu,
          };
        })
      ),
      onFilter: (value, record) => record.tenVatTu.includes(value),
      filterSearch: true,
    },
    {
      title: "Đơn vị tính",
      dataIndex: "tenDonViTinh",
      key: "tenDonViTinh",
      align: "center",
      filters: removeDuplicates(
        map(Data, (d) => {
          return {
            text: d.tenDonViTinh,
            value: d.tenDonViTinh,
          };
        })
      ),
      onFilter: (value, record) => record.tenDonViTinh.includes(value),
      filterSearch: true,
    },
    {
      title: "Định mức (BOM)",
      dataIndex: "dinhMuc",
      key: "dinhMuc",
      align: "center",
    },
    {
      title: "SL theo BOM",
      dataIndex: "soLuongDinhMucKeHoach",
      key: "soLuongDinhMucKeHoach",
      align: "center",
    },
    {
      title: "SL xuất thực tế",
      dataIndex: "soLuongXuatThucTe",
      key: "soLuongXuatThucTe",
      align: "center",
    },
    {
      title: "SL thiếu",
      dataIndex: "soLuongThieu",
      key: "soLuongThieu",
      align: "center",
    },
    {
      title: "SL dư",
      dataIndex: "soLuongDu",
      key: "soLuongDu",
      align: "center",
    },
    {
      title: "SL theo BOM SP",
      dataIndex: "soLuongDinhMucSanXuat",
      key: "soLuongDinhMucSanXuat",
      align: "center",
    },
    {
      title: "Tỷ lệ",
      dataIndex: "phanTram",
      key: "phanTram",
      align: "center",
    },
  ];
  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  const columns = map(colValues, (col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        info: col.info,
      }),
    };
  });

  const XuatExcel = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_BaoCao/export-file-excel-thanh-ly`,
          "POST",
          DataXuat,
          "",
          "",
          resolve,
          reject
        )
      );
    }).then((res) => {
      exportExcel("BaoCaoThanhLy", res.data.dataexcel);
    });
  };

  const addButtonRender = () => {
    return (
      <>
        <Button
          icon={<DownloadOutlined />}
          className="th-btn-margin-bottom-0"
          type="primary"
          onClick={XuatExcel}
          disabled={(permission && !permission.add) || DataXuat.length === 0}
        >
          Xuất excel
        </Button>
      </>
    );
  };

  const handleOnSelectPhongBan = (value) => {
    setPhongBan(value);
    setSanPham(null);
    getListSanPham(value, TuNgay, DenNgay);
    getListData(value, null, TuNgay, DenNgay);
  };

  const handleOnSelectSanPham = (value) => {
    setSanPham(value);
    getListData(PhongBan, value, TuNgay, DenNgay);
  };

  const handleChangeNgay = (dateString) => {
    setTuNgay(dateString[0]);
    setDenNgay(dateString[1]);
    setSanPham(null);
    getListSanPham(PhongBan, dateString[0], dateString[1]);
    getListData(PhongBan, null, dateString[0], dateString[1]);
  };

  return (
    <div className="gx-main-content">
      <ContainerHeader
        title={"Báo cáo so sánh định mức"}
        description="Báo cáo so sánh định mức"
        buttons={addButtonRender()}
      />
      <Card className="th-card-margin-bottom th-card-reset-margin">
        <Row style={{ marginBottom: 10 }}>
          <Col
            xxl={6}
            xl={8}
            lg={12}
            md={12}
            sm={24}
            xs={24}
            style={{ marginBottom: 8 }}
          >
            <h5>Xưởng:</h5>
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListPhongBan ? ListPhongBan : []}
              placeholder="Chọn xưởng"
              optionsvalue={["id", "tenPhongBan"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="name"
              onSelect={handleOnSelectPhongBan}
              value={PhongBan}
            />
          </Col>
          <Col
            xxl={6}
            xl={8}
            lg={12}
            md={12}
            sm={24}
            xs={24}
            style={{ marginBottom: 8 }}
          >
            <h5>Sản phẩm:</h5>
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListSanPham ? ListSanPham : []}
              placeholder="Chọn sản phẩm"
              optionsvalue={["id", "tenSanPham"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="name"
              onSelect={handleOnSelectSanPham}
              value={SanPham}
            />
          </Col>
          <Col
            xxl={6}
            xl={8}
            lg={12}
            md={12}
            sm={24}
            xs={24}
            style={{ marginBottom: 8 }}
          >
            <h5>Ngày:</h5>
            <RangePicker
              format={"DD/MM/YYYY"}
              onChange={(date, dateString) => handleChangeNgay(dateString)}
              defaultValue={[
                moment(TuNgay, "DD/MM/YYYY"),
                moment(DenNgay, "DD/MM/YYYY"),
              ]}
              allowClear={false}
            />
          </Col>
        </Row>
        <Table
          bordered
          columns={columns}
          scroll={{ x: 900, y: "55vh" }}
          components={components}
          className="gx-table-responsive"
          dataSource={reDataForTable(Data)}
          size="small"
          rowClassName={"editable-row"}
          loading={loading}
          pagination={false}
        />
      </Card>
    </div>
  );
}

export default SoSanhDinhMuc;
