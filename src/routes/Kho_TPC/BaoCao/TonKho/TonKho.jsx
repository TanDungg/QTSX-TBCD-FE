import { DownloadOutlined } from "@ant-design/icons";
import { Button, Card, Row, Col, DatePicker } from "antd";
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
import { convertObjectToUrlParams } from "src/util/Common";
import moment from "moment";
import ModalChiTietPhieu from "./ModalChiTietPhieu";
const { EditableRow, EditableCell } = EditableTableRow;
const { RangePicker } = DatePicker;

function TonKho({ permission, history, match }) {
  const dispatch = useDispatch();
  const { loading } = useSelector(({ common }) => common).toJS();
  // const INFO = { ...getLocalStorage("menu"), user_Id: getTokenInfo().id };
  const [Data, setData] = useState([]);
  const [DataView, setDataView] = useState([]);
  const [ActiveModale, setActiveModale] = useState(false);
  const [Loai, setLoai] = useState(false);
  const [Kho, setKho] = useState("");
  const [Info, setInfo] = useState({});
  const [ListKho, setListKho] = useState([]);
  const [TuNgay, setTuNgay] = useState(getDateNow(-7));
  const [DenNgay, setDenNgay] = useState(getDateNow());
  const [keyword, setKeyword] = useState(null);

  useEffect(() => {
    if (permission && permission.view) {
      getKho();
    } else if ((permission && !permission.view) || permission === undefined) {
      history.push("/home");
    }
    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getListData = (KeyWord, TuNgay, DenNgay, CauTrucKho_Id) => {
    let param = convertObjectToUrlParams({
      KeyWord,
      TuNgay,
      DenNgay,
      CauTrucKho_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_BaoCao/bao-cao-ton-kho-theo-kho-sp-vt?${param}`,
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
    // let params = convertObjectToUrlParams({
    //   KeyWord,
    //   TuNgay,
    //   Nam,
    //   page: -1,
    // });
    // new Promise((resolve, reject) => {
    //   dispatch(
    //     fetchStart(
    //       `lkn_BaoCao/get-bao-cao-ton-kho?${params}`,
    //       "GET",
    //       null,
    //       "DETAIL",
    //       "",
    //       resolve,
    //       reject
    //     )
    //   );
    // })
    //   .then((res) => {
    //     if (res && res.data) {
    //       setDataXuat(res.data);
    //     }
    //   })
    //   .catch((error) => console.error(error));
  };
  const getKho = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `CauTrucKho/get-list-kho-vat-tu-thanh-pham`,
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
          setKho(res.data[0].id);
          setLoai(res.data[0].isThanhPham ? true : false);
          getListData(keyword, TuNgay, DenNgay, res.data[0].id);
        } else {
          setListKho([]);
        }
      })
      .catch((error) => console.error(error));
  };
  const onChangeKeyword = (val) => {
    setKeyword(val.target.value);
    if (isEmpty(val.target.value)) {
      getListData(val.target.value, TuNgay, DenNgay, Kho);
    }
  };

  const onSearchKeyword = () => {
    getListData(keyword, TuNgay, DenNgay, Kho);
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

  const dataList = reDataForTable(Data);

  let colValues = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      width: 50,
      align: "center",
    },
    {
      title: Loai ? "Mã sản phẩm" : "Mã vật tư",
      dataIndex: "ma",
      key: "ma",
      align: "center",
      width: 150,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.ma,
            value: d.ma,
          };
        })
      ),
      onFilter: (value, record) => record.ma.includes(value),
      filterSearch: true,
    },
    {
      title: Loai ? "Tên sản phẩm" : "Tên vật tư",
      dataIndex: "ten",
      key: "ten",
      align: "center",
      width: 250,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.ten,
            value: d.ten,
          };
        })
      ),
      onFilter: (value, record) => record.ten.includes(value),
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
      title: "Tồn đầu kỳ",
      dataIndex: "tonDauKy",
      key: "tonDauKy",
      align: "center",
      width: 150,
    },
    {
      title: "Số lượng nhập",
      dataIndex: "soLuongNhap",
      key: "soLuongNhap",
      align: "center",
      width: 150,
      render: (val, record) => {
        return (
          <a
            onClick={() => {
              setActiveModale(true);
              setInfo({
                ma: record.ma,
                ten: record.ten,
                isNhap: true,
              });
              if (record.list_PhieuNhaps) {
                setDataView(JSON.parse(record.list_PhieuNhaps));
              } else {
                setDataView([]);
              }
            }}
          >
            {val}
          </a>
        );
      },
    },
    {
      title: "Số lượng xuất",
      dataIndex: "soLuongXuat",
      key: "soLuongXuat",
      align: "center",
      width: 150,
      render: (val, record) => {
        return (
          <a
            onClick={() => {
              setActiveModale(true);
              setInfo({
                ma: record.ma,
                ten: record.ten,
                isNhap: false,
              });
              if (record.list_PhieuXuats) {
                setDataView(JSON.parse(record.list_PhieuXuats));
              } else {
                setDataView([]);
              }
            }}
          >
            {val}
          </a>
        );
      },
    },

    {
      title: "Tồn cuối kỳ",
      dataIndex: "tonCuoiKy",
      key: "tonCuoiKy",
      align: "center",
      width: 150,
      render: (val, record) => {
        return (
          <a
            onClick={() => {
              setActiveModale(true);
              setInfo({
                ma: record.ma,
                ten: record.ten,
                isNhap: undefined,
              });
              if (record.list_PhieuNhapXuats) {
                setDataView(JSON.parse(record.list_PhieuNhapXuats));
              } else {
                setDataView([]);
              }
            }}
          >
            {val}
          </a>
        );
      },
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
      cauTrucKho_Id: Kho,
      tuNgay: TuNgay,
      denNgay: DenNgay,
      list_ChiTiets: Data,
    };
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_BaoCao/export-file-bao-cao-ton-kho-theo-kho-sp-vt`,
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
        `BaoCaoTonKho${Loai ? "ThanhPham" : "VatTu"}`,
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
          disabled={(permission && !permission.add) || Data.length === 0}
        >
          Xuất excel
        </Button>
      </>
    );
  };
  const handleOnSelectKho = (val) => {
    if (val !== Kho) {
      ListKho.forEach((k) => {
        if (k.id === val) {
          if (k.isThanhPham) {
            setLoai(true);
          } else {
            setLoai(false);
          }
        }
      });
      setKho(val);
      getListData(keyword, TuNgay, DenNgay, val);
    }
  };
  const handleChangeNgay = (dateString) => {
    if (TuNgay !== dateString[0] && DenNgay !== dateString[1]) {
      setTuNgay(dateString[0]);
      setDenNgay(dateString[1]);
      getListData(keyword, dateString[0], dateString[1], Kho);
    }
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
            <h5>Kho:</h5>
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListKho}
              placeholder="Chọn kho"
              optionsvalue={["id", "tenCTKho"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="name"
              onSelect={handleOnSelectKho}
              value={Kho}
            />
          </Col>
          {/* <Col
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
          </Col> */}
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
          scroll={{ x: 1200, y: "55vh" }}
          components={components}
          className="gx-table-responsive"
          dataSource={dataList}
          size="small"
          rowClassName={"editable-row"}
          loading={loading}
          pagination={{
            pageSize: 20,
            total: dataList.length,
            showSizeChanger: false,
            showQuickJumper: true,
          }}
        />
      </Card>
      <ModalChiTietPhieu
        openModal={ActiveModale}
        openModalFS={setActiveModale}
        data={DataView}
        loai={Loai}
        info={Info}
      />
    </div>
  );
}

export default TonKho;
