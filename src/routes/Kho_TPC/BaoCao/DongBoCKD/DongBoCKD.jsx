import { Card, Row, Col, DatePicker } from "antd";
import { map } from "lodash";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions/Common";
import { getDateNow, reDataForTable } from "src/util/Common";
import { EditableTableRow, Table, Select } from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";
import { convertObjectToUrlParams } from "src/util/Common";
import moment from "moment";
const { EditableRow, EditableCell } = EditableTableRow;
const { RangePicker } = DatePicker;

function DongBoCKD({ permission, history }) {
  const dispatch = useDispatch();
  const { loading } = useSelector(({ common }) => common).toJS();
  const [Data, setData] = useState([]);
  const Lot = "";
  // const [Lot, setLot] = useState("");
  const [SanPham, setSanPham] = useState("");
  const [ListSanPham, setListSanPham] = useState([]);
  const [ListLoaiSanPham, setListLoaiSanPham] = useState([]);
  const [LoaiSanPham, setLoaiSanPham] = useState("");
  // const [ListLot, setListLot] = useState([]);
  const [TuNgay, setTuNgay] = useState(getDateNow(-new Date().getDate() + 1));
  const [DenNgay, setDenNgay] = useState(getDateNow());
  // const [keyword, setKeyword] = useState(null);

  useEffect(() => {
    if (permission && permission.view) {
      getLoaiSanPham();
      getListData(LoaiSanPham, SanPham, Lot, TuNgay, DenNgay);
    } else if ((permission && !permission.view) || permission === undefined) {
      history.push("/home");
    }
    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getListData = (loaiSanPham_Id, sanPham_Id, lot_Id, TuNgay, DenNgay) => {
    let param = convertObjectToUrlParams({
      lot_Id,
      TuNgay,
      DenNgay,
      sanPham_Id,
      loaiSanPham_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_BaoCao/bao-cao-dong-bo-ckd?${param}`,
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
        if (res && res.status === 200) {
          const newData = [];
          res.data.forEach((dt) => {
            dt.list_chiTiet.forEach((ct) => {
              newData.push({
                ...dt,
                ...ct,
              });
            });
          });
          setData(newData);
        }
      })
      .catch((error) => console.error(error));
  };
  const getLoaiSanPham = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `LoaiSanPham?page=-1`,
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
          setListLoaiSanPham(res.data);
        } else {
          setListLoaiSanPham([]);
        }
      })
      .catch((error) => console.error(error));
  };
  const getSanPham = (loaiSanPham_Id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `SanPham?loaiSanPham_Id=${loaiSanPham_Id}&&page=-1`,
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
  // const onChangeKeyword = (val) => {
  //   setKeyword(val.target.value);
  //   if (isEmpty(val.target.value)) {
  //     getListData(val.target.value, TuNgay, DenNgay, SanPham);
  //   }
  // };

  // const onSearchKeyword = () => {
  //   getListData(keyword, TuNgay, DenNgay, SanPham);
  // };

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
  const renderRow = (record) => {
    const index = record.list_chiTiet.findIndex(
      (ct) => ct.maVatTu === record.maVatTu
    );
    if (index !== -1) {
      if (index === 0) {
        return {
          rowSpan: record.list_chiTiet.length,
        };
      } else {
        return {
          rowSpan: 0,
        };
      }
    }
    return {};
  };
  let colValues = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      width: 50,
      align: "center",
      onCell: renderRow,
    },
    {
      title: "Mã sản phẩm",
      dataIndex: "maSanPham",
      key: "maSanPham",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.maSanPham,
            value: d.maSanPham,
          };
        })
      ),
      onFilter: (value, record) => record.maSanPham.includes(value),
      filterSearch: true,
      onCell: renderRow,
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "tenSanPham",
      key: "tenSanPham",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenSanPham,
            value: d.tenSanPham,
          };
        })
      ),
      onFilter: (value, record) => record.tenSanPham.includes(value),
      filterSearch: true,
      onCell: renderRow,
    },
    {
      title: "Lot",
      dataIndex: "soLot",
      key: "soLot",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.soLot,
            value: d.soLot,
          };
        })
      ),
      onFilter: (value, record) => record.soLot.includes(value),
      filterSearch: true,
      onCell: renderRow,
    },
    {
      title: "Phiên bản",
      dataIndex: "phienBan",
      key: "phienBan",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.phienBan,
            value: d.phienBan,
          };
        })
      ),
      onFilter: (value, record) => record.phienBan.includes(value),
      filterSearch: true,
      onCell: renderRow,
    },
    {
      title: "Mã vật tư",
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
      title: "Tên vật tư",
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
      title: "Số lượng chi tiết",
      dataIndex: "soLuongDaNhan",
      key: "soLuongDaNhan",
      align: "center",
    },
    {
      title: "Số lượng bộ",
      dataIndex: "soLuongBoDaNhan",
      key: "soLuongBoDaNhan",
      align: "center",
      onCell: renderRow,
    },
    {
      title: "Số lượng Lot",
      dataIndex: "soLuongLot",
      key: "soLuongLot",
      align: "center",
      onCell: renderRow,
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

  // const XuatExcel = () => {
  //   new Promise((resolve, reject) => {
  //     dispatch(
  //       fetchStart(
  //         `lkn_BaoCao/export-file-bao-cao-ton-SanPham-theo-SanPham-sp-vt`,
  //         "POST",
  //         {
  //           cauTrucSanPham_Id: SanPham,
  //           tuNgay: TuNgay,
  //           denNgay: DenNgay,
  //           list_ChiTiets: Data,
  //         },
  //         "",
  //         "",
  //         resolve,
  //         reject
  //       )
  //     );
  //   }).then((res) => {
  //     exportExcel(
  //       `BaoCaoTonSanPham${Lot ? "ThanhPham" : "VatTu"}`,
  //       res.data.dataexcel
  //     );
  //   });
  // };

  // const addButtonRender = () => {
  //   return (
  //     <>
  //       <Button
  //         icon={<DownloadOutlined />}
  //         className="th-margin-bottom-0"
  //         type="primary"
  //         onClick={XuatExcel}
  //         disabled={(permission && !permission.add) || Data.length === 0}
  //       >
  //         Xuất excel
  //       </Button>
  //     </>
  //   );
  // };
  const handleOnSelectSanPham = (val) => {
    if (val !== SanPham) {
      setSanPham(val);
      getListData(LoaiSanPham, val, Lot, TuNgay, DenNgay);
    }
  };
  const handleOnSelectLoaiSanPham = (val) => {
    if (val !== LoaiSanPham) {
      setLoaiSanPham(val);
      setSanPham("");
      getSanPham(val);
      getListData(val, "", Lot, TuNgay, DenNgay);
    }
  };
  const handleOnClearLoaiSanPham = () => {
    setLoaiSanPham("");
    setSanPham("");
    getListData("", "", Lot, TuNgay, DenNgay);
  };
  const handleOnClearSanPham = () => {
    setSanPham("");
    getListData(LoaiSanPham, "", Lot, TuNgay, DenNgay);
  };
  const handleChangeNgay = (dateString) => {
    if (TuNgay !== dateString[0] || DenNgay !== dateString[1]) {
      setTuNgay(dateString[0]);
      setDenNgay(dateString[1]);
      getListData(LoaiSanPham, SanPham, Lot, dateString[0], dateString[1]);
    }
  };

  return (
    <div className="gx-main-content">
      <ContainerHeader
        title={"Báo cáo đồng bộ CKD"}
        description="Báo cáo đồng bộ CKD"
        // buttons={addButtonRender()}
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
            <h5>Loại sản phẩm:</h5>
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListLoaiSanPham}
              placeholder="Chọn loại sản phẩm"
              optionsvalue={["id", "tenLoaiSanPham"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="name"
              onSelect={handleOnSelectLoaiSanPham}
              onClear={handleOnClearLoaiSanPham}
              value={LoaiSanPham}
              allowClear
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
              data={ListSanPham}
              placeholder="Chọn sản phẩm"
              optionsvalue={["id", "tenSanPham"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="name"
              onSelect={handleOnSelectSanPham}
              onClear={handleOnClearSanPham}
              value={SanPham}
              allowClear
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
          {/* <Col
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
          </Col> */}
        </Row>
        <Table
          bordered
          columns={columns}
          scroll={{ x: 992, y: "55vh" }}
          components={components}
          className="gx-table-responsive"
          dataSource={dataList}
          size="small"
          rowClassName={"editable-row"}
          loading={loading}
          pagination={false}
        />
      </Card>
    </div>
  );
}

export default DongBoCKD;
