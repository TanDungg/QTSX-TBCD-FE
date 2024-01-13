import { DownloadOutlined } from "@ant-design/icons";
import { Button, Card, Row, Col, DatePicker } from "antd";
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
import { convertObjectToUrlParams } from "src/util/Common";
import moment from "moment";
const { RangePicker } = DatePicker;

const { EditableRow, EditableCell } = EditableTableRow;

function DieuChuyen({ permission, history, match }) {
  const dispatch = useDispatch();
  const { loading } = useSelector(({ common }) => common).toJS();
  const [Data, setData] = useState([]);
  const [Loai, setLoai] = useState("sanpham");
  const [ListKho, setListKho] = useState([]);
  const [ListKhoDi, setListKhoDi] = useState([]);
  const [ListKhoDen, setListKhoDen] = useState([]);
  const [KhoDi, setKhoDi] = useState(null);
  const [KhoDen, setKhoDen] = useState(null);
  const [TuNgay, setTuNgay] = useState(getDateNow(-7));
  const [DenNgay, setDenNgay] = useState(getDateNow());
  const [keyword, setKeyword] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (permission && permission.view) {
      getListData(
        KhoDi,
        KhoDen,
        keyword,
        TuNgay,
        DenNgay,
        page,
        Loai === "sanpham" ? true : false
      );
      getKho(Loai);
      getListKhoDen(Loai);
    } else if ((permission && !permission.view) || permission === undefined) {
      history.push("/home");
    }
    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getListData = (
    KhoDi_Id,
    KhoDen_Id,
    Keyword,
    TuNgay,
    DenNgay,
    page,
    IsThanhPham
  ) => {
    let param = convertObjectToUrlParams({
      KhoDi_Id,
      KhoDen_Id,
      Keyword,
      TuNgay,
      DenNgay,
      page,
      IsThanhPham,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_BaoCao/bao-cao-dieu-chuyen?${param}`,
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
          setData(res.data);
        }
      })
      .catch((error) => console.error(error));
  };

  const getKho = (Loai) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `CauTrucKho/cau-truc-kho-by-thu-tu?thuTu=${
            Loai === "sanpham" ? 101 : 1
          }
          &&isThanhPham=${Loai === "sanpham" ? true : false}`,
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
        setListKhoDi(res.data);
      } else {
        setListKhoDi([]);
      }
    });
  };

  const getListKhoDen = (Loai) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `CauTrucKho/cau-truc-kho-vat-tu-san-pham`,
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
          setListKho(res.data);
          setListKhoDen(res.data);
        } else {
          setListKho([]);
          setListKhoDen([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const onChangeKeyword = (val) => {
    setPage(1);
    setKeyword(val.target.value);
    if (isEmpty(val.target.value)) {
      getListData(
        KhoDi,
        KhoDen,
        val.target.value,
        TuNgay,
        DenNgay,
        1,
        Loai === "sanpham" ? true : false
      );
    }
  };

  const onSearchKeyword = () => {
    getListData(
      KhoDi,
      KhoDen,
      keyword,
      TuNgay,
      DenNgay,
      1,
      Loai === "sanpham" ? true : false
    );
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
  // const { totalRow, pageSize } = Data;

  const dataList = reDataForTable(Data);

  let colValues = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      width: 40,
      align: "center",
    },
    {
      title: Loai === "sanpham" ? "Mã sản phẩm" : "Mã vật tư",
      dataIndex: "maVatTu",
      key: "maVatTu",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
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
      title: Loai === "sanpham" ? "Tên sản phẩm" : "Tên vật tư",
      dataIndex: "tenVatTu",
      key: "tenVatTu",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
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
      title: "Số lượng",
      dataIndex: "soLuong",
      key: "soLuong",
      align: "center",
    },
    {
      title: "Đơn vị tính",
      dataIndex: "tenDonViTinh",
      key: "tenDonViTinh",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
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
      title: "Kho đi",
      dataIndex: "tenKhoDi",
      key: "tenKhoDi",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenKhoDi,
            value: d.tenKhoDi,
          };
        })
      ),
      onFilter: (value, record) => record.tenKhoDi.includes(value),
      filterSearch: true,
    },
    {
      title: "Kho đến",
      dataIndex: "tenKhoDen",
      key: "tenKhoDen",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenKhoDen,
            value: d.tenKhoDen,
          };
        })
      ),
      onFilter: (value, record) => record.tenKhoDen.includes(value),
      filterSearch: true,
    },
    {
      title: "Ngày điều chuyển",
      dataIndex: "ngayYeuCau",
      key: "ngayYeuCau",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.ngayYeuCau,
            value: d.ngayYeuCau,
          };
        })
      ),
      onFilter: (value, record) => record.ngayYeuCau.includes(value),
      filterSearch: true,
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
          `lkn_BaoCao/export-file-excel-dieu-chuyen`,
          "POST",
          Data,
          "",
          "",
          resolve,
          reject
        )
      );
    }).then((res) => {
      exportExcel(
        `BaoCaoDieuChuyen${Loai === "sanpham" ? "ThanhPham" : "VatTu"}`,
        res.data.dataexcel
      );
    });
  };

  const addButtonRender = () => {
    return (
      <>
        <Button
          icon={<DownloadOutlined />}
          className="th-margin-bottom-0"
          type="primary"
          onClick={XuatExcel}
          disabled={(permission && !permission.add) || Data.length === 0}
        >
          Xuất excel
        </Button>
      </>
    );
  };

  const handleOnSelectLoai = (value) => {
    setLoai(value);
    getKho(value);
    setKhoDi(null);
    setKhoDen(null);
    getListData(
      KhoDi,
      KhoDen,
      keyword,
      TuNgay,
      DenNgay,
      1,
      value === "sanpham" ? true : false
    );
  };

  const handleOnSelectKhoDi = (value) => {
    setKhoDi(value);
    setKhoDen(null);
    const newData = ListKho.filter((d) => d.id !== value);
    setListKhoDen(newData);
    getListData(
      value,
      KhoDen,
      keyword,
      TuNgay,
      DenNgay,
      1,
      Loai === "sanpham" ? true : false
    );
  };

  const handleClearKhoDi = () => {
    setKhoDi(null);
    setKhoDen(null);
    setPage(1);
    getListData(
      null,
      null,
      keyword,
      TuNgay,
      DenNgay,
      1,
      Loai === "sanpham" ? true : false
    );
  };
  const handleOnSelectKhoDen = (value) => {
    setKhoDen(value);
    getListData(
      KhoDi,
      value,
      keyword,
      TuNgay,
      DenNgay,
      1,
      Loai === "sanpham" ? true : false
    );
  };

  const handleClearKhoDen = () => {
    setKhoDen(null);
    setPage(1);
    getListData(
      KhoDi,
      null,
      keyword,
      TuNgay,
      DenNgay,
      1,
      Loai === "sanpham" ? true : false
    );
  };

  const handleChangeNgay = (dateString) => {
    setTuNgay(dateString[0]);
    setDenNgay(dateString[1]);
    setPage(1);
    getListData(
      KhoDi,
      KhoDen,
      keyword,
      dateString[0],
      dateString[1],
      1,
      Loai === "sanpham" ? true : false
    );
  };

  return (
    <div className="gx-main-content">
      <ContainerHeader
        title={"Báo cáo điều chuyển"}
        description="Báo cáo điều chuyển"
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
            <h5>Sản phẩm/Vật tư:</h5>
            <Select
              className="heading-select slt-search th-select-heading"
              data={[
                {
                  key: "sanpham",
                  value: "Sản phẩm",
                },
                {
                  key: "vattu",
                  value: "Vật tư",
                },
              ]}
              placeholder="Chọn kho"
              optionsvalue={["key", "value"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="name"
              onSelect={handleOnSelectLoai}
              value={Loai}
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
            <h5>Kho đi:</h5>
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListKhoDi ? ListKhoDi : []}
              placeholder="Chọn kho đi"
              optionsvalue={["id", "tenCTKho"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="name"
              onSelect={handleOnSelectKhoDi}
              value={KhoDi}
              allowClear
              onClear={handleClearKhoDi}
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
            <h5>Kho đến:</h5>
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListKhoDen ? ListKhoDen : []}
              placeholder="Chọn kho đến"
              optionsvalue={["id", "tenCTKho"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="name"
              onSelect={handleOnSelectKhoDen}
              value={KhoDen}
              allowClear
              onClear={handleClearKhoDen}
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
          <Col
            xxl={6}
            xl={8}
            lg={12}
            md={12}
            sm={24}
            xs={24}
            style={{ marginBottom: 8 }}
          >
            <h5>Tìm kiếm:</h5>
            <Toolbar
              count={1}
              search={{
                loading,
                value: keyword,
                onChange: onChangeKeyword,
                onPressEnter: onSearchKeyword,
                onSearch: onSearchKeyword,
                allowClear: true,
                placeholder: "Tìm kiếm",
              }}
            />
          </Col>
        </Row>
        <Table
          bordered
          columns={columns}
          scroll={{ x: 900, y: "55vh" }}
          components={components}
          className="gx-table-responsive"
          dataSource={dataList}
          size="small"
          rowClassName={"editable-row"}
          loading={loading}
          pagination={
            false
            //   {
            //   onChange: handleTableChange,
            //   pageSize: pageSize,
            //   total: totalRow,
            //   showSizeChanger: false,
            //   showQuickJumper: true,
            // }
          }
        />
      </Card>
    </div>
  );
}

export default DieuChuyen;
