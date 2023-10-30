import { DownloadOutlined } from "@ant-design/icons";
import { Button, Card, Row, Col, DatePicker, Divider } from "antd";
import { map, isEmpty } from "lodash";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions/Common";
import {
  exportExcel,
  getDateNow,
  getNamNow,
  getThangNow,
  reDataForTable,
} from "src/util/Common";
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

function TonKho({ permission, history, match }) {
  const dispatch = useDispatch();
  const { loading } = useSelector(({ common }) => common).toJS();
  const INFO = { ...getLocalStorage("menu"), user_Id: getTokenInfo().id };
  const [Data, setData] = useState([]);
  const [DataXuat, setDataXuat] = useState([]);
  const [Loai, setLoai] = useState("sanpham");
  const [Thang, setThang] = useState(getThangNow());
  const [Nam, setNam] = useState(getNamNow());
  const [keyword, setKeyword] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (permission && permission.view) {
      getListData(keyword, Thang, Nam, page, Loai === "sanpham" ? true : false);
    } else if ((permission && !permission.view) || permission === undefined) {
      history.push("/home");
    }
    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getListData = (KeyWord, Thang, Nam, page, IsThanhPham) => {
    let param = convertObjectToUrlParams({
      KeyWord,
      Thang,
      Nam,
      page,
      IsThanhPham,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_BaoCao/get-bao-cao-ton-kho?${param}`,
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
    let params = convertObjectToUrlParams({
      KeyWord,
      Thang,
      Nam,
      page: -1,
      IsThanhPham,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_BaoCao/get-bao-cao-ton-kho?${params}`,
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
          setDataXuat(res.data);
        }
      })
      .catch((error) => console.error(error));
  };

  const onChangeKeyword = (val) => {
    setPage(1);
    setKeyword(val.target.value);
    if (isEmpty(val.target.value)) {
      getListData(
        val.target.value,
        Thang,
        Nam,
        1,
        Loai === "sanpham" ? true : false
      );
    }
  };

  const onSearchKeyword = () => {
    getListData(keyword, Thang, Nam, 1, Loai === "sanpham" ? true : false);
  };

  const handleTableChange = (pagination) => {
    setPage(pagination);
    getListData(
      keyword,
      Thang,
      Nam,
      pagination,
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
  const { totalRow, pageSize } = Data;

  const dataList = reDataForTable(
    Data.datalist,
    page === 1 ? page : pageSize * (page - 1) + 2
  );

  let colValues = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      width: 50,
      align: "center",
    },
    {
      title: Loai === "sanpham" ? "Mã sản phẩm" : "Mã vật tư",
      dataIndex: "maVatTu",
      key: "maVatTu",
      align: "center",
      width: 150,
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
      width: 250,
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
      title: "Đơn vị tính",
      dataIndex: "tenDonViTinh",
      key: "tenDonViTinh",
      align: "center",
      width: 150,
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
      title: "Số lượng nhập",
      dataIndex: "soLuongNhap",
      key: "soLuongNhap",
      align: "center",
      width: 150,
    },
    {
      title: "Số lượng xuất",
      dataIndex: "soLuongXuat",
      key: "soLuongXuat",
      align: "center",
      width: 150,
    },
    {
      title: "Tồn đầu kỳ",
      dataIndex: "tonDauKy",
      key: "tonDauKy",
      align: "center",
      width: 150,
    },
    {
      title: "Tồn cuối kỳ",
      dataIndex: "tonCuoiKy",
      key: "tonCuoiKy",
      align: "center",
      width: 150,
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
    const newData = {
      isThanhPham: Loai === "sanpham" ? true : false,
      thang: Thang,
      nam: Nam,
      ctPhieuTonKho: DataXuat,
    };
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_BaoCao/export-file-excel-ton-kho`,
          "POST",
          newData,
          "",
          "",
          resolve,
          reject
        )
      );
    }).then((res) => {
      exportExcel(
        `BaoCaoTonKho${Loai === "sanpham" ? "ThanhPham" : "VatTu"}`,
        res.data.dataexcel
      );
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

  const handleOnSelectLoai = (value) => {
    setLoai(value);
    getListData(keyword, Thang, Nam, 1, value === "sanpham" ? true : false);
  };

  const handleChangeThang = (month) => {
    setThang(month.format("MM"));
    setNam(month.format("yyyy"));
    getListData(
      keyword,
      month.format("MM"),
      month.format("yyyy"),
      page,
      Loai === "sanpham" ? true : false
    );
  };

  return (
    <div className="gx-main-content">
      <ContainerHeader
        title={"Báo cáo tồn kho"}
        description="Báo cáo tồn kho"
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
            <h5>Tháng:</h5>
            <DatePicker
              picker="month"
              format={"MM - YYYY"}
              onChange={(month) => handleChangeThang(month)}
              defaultValue={moment(Thang, "MM - YYYY")}
              allowClear={false}
            />
          </Col>
        </Row>
        <Table
          bordered
          columns={columns}
          scroll={{ x: 1200, y: "55vh" }}
          components={components}
          className="gx-table-responsive"
          dataSource={dataList}
          size="small"
          rowClassName={"editable-row"}
          loading={loading}
          pagination={{
            onChange: handleTableChange,
            pageSize: pageSize,
            total: totalRow,
            showSizeChanger: false,
            showQuickJumper: true,
          }}
        />
      </Card>
    </div>
  );
}

export default TonKho;
