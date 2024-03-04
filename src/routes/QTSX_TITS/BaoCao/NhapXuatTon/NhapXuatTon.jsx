import { Card, Row, Col, DatePicker } from "antd";
import { map, isEmpty } from "lodash";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions/Common";
import { getDateNow, reDataForTable } from "src/util/Common";
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
function NhapXuatTon({ permission, history, match }) {
  const dispatch = useDispatch();
  const { loading } = useSelector(({ common }) => common).toJS();
  const [Data, setData] = useState([]);
  const [TuNgay, setTuNgay] = useState(getDateNow(-14));
  const [DenNgay, setDenNgay] = useState(getDateNow());
  const [keyword, setKeyword] = useState("");
  const [CauTrucKho_Id, setCauTrucKho_Id] = useState("");
  const [ListKho, setListKho] = useState([]);
  const [IsThanhPham, setIsThanhPham] = useState(false);

  useEffect(() => {
    if (permission && permission.view) {
      getKho();
    } else if ((permission && !permission.view) || permission === undefined) {
      history.push("/home");
    }
    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getListData = (
    keyword,
    tuNgay,
    denNgay,
    tits_qtsx_CauTrucKho_Id,
    tits_qtsx_VatPham_Id
  ) => {
    let param = convertObjectToUrlParams({
      keyword,
      tuNgay,
      denNgay,
      tits_qtsx_CauTrucKho_Id,
      tits_qtsx_VatPham_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_BaoCao/bao-cao-nhap-xuat-ton?${param}`,
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
    //   DenNgay,
    //   CauTrucKho_Id,
    //   VatTu_Id,
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
    const params = convertObjectToUrlParams({
      thuTu: 1,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_CauTrucKho/cau-truc-kho-by-thu-tu?${params}`,
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
          setCauTrucKho_Id(res.data[0].id);
          setIsThanhPham(res.data[0].isThanhPham);
          getListData(keyword, TuNgay, DenNgay, res.data[0].id);
          setListKho(res.data);
        } else {
          setListKho([]);
        }
      })
      .catch((error) => console.error(error));
  };
  const onChangeKeyword = (val) => {
    setKeyword(val.target.value);
    if (isEmpty(val.target.value)) {
      getListData(val.target.value, TuNgay, DenNgay, CauTrucKho_Id);
    }
  };

  const onSearchKeyword = () => {
    getListData(keyword, TuNgay, DenNgay, CauTrucKho_Id);
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
      title: IsThanhPham ? "Mã sản phẩm" : "Mã vật tư",
      key: "maVatPham",
      dataIndex: "maVatPham",
      align: "center",
      width: 150,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.maVatPham,
            value: d.maVatPham,
          };
        })
      ),
      onFilter: (value, record) => record.maVatPham.includes(value),
      filterSearch: true,
    },
    {
      title: IsThanhPham ? "Tên sản phẩm" : "Tên vật tư",
      dataIndex: "tenVatPham",
      key: "tenVatPham",
      align: "center",
      width: 250,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenVatPham,
            value: d.tenVatPham,
          };
        })
      ),
      onFilter: (value, record) => record.tenVatPham.includes(value),
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
      dataIndex: "soLuongTonDauKy",
      key: "soLuongTonDauKy",
      align: "center",
      width: 150,
    },
    {
      title: "Tồn cuối kỳ",
      dataIndex: "soLuongTonCuoiKy",
      key: "soLuongTonCuoiKy",
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

  // const XuatExcel = () => {
  //   new Promise((resolve, reject) => {
  //     dispatch(
  //       fetchStart(
  //         `lkn_BaoCao/export-file-nhap-xuat-ton`,
  //         "POST",
  //         Data,
  //         "",
  //         "",
  //         resolve,
  //         reject
  //       )
  //     );
  //   }).then((res) => {
  //     exportExcel(`BaoCaoNhapXuatTon`, res.data.dataexcel);
  //   });
  // };

  // const addButtonRender = () => {
  //   return (
  //     <>
  //       <Button
  //         icon={<DownloadOutlined />}
  //         classDenNgaye="th-margin-bottom-0"
  //         type="primary"
  //         onClick={XuatExcel}
  //         disabled={(permission && !permission.add) || Data.length === 0}
  //       >
  //         Xuất excel
  //       </Button>
  //     </>
  //   );
  // };

  const handleOnSelectKho = (value) => {
    if (CauTrucKho_Id !== value) {
      setIsThanhPham(ListKho.filter((k) => k.id === value)[0].isThanhPham);
      setCauTrucKho_Id(value);
      getListData(keyword, TuNgay, DenNgay, value);
    }
  };

  const handleChangeNgay = (dateString) => {
    if (TuNgay !== dateString[0] || DenNgay !== dateString[1]) {
      setTuNgay(dateString[0]);
      setDenNgay(dateString[1]);
      getListData(keyword, dateString[0], dateString[1], CauTrucKho_Id);
    }
  };
  return (
    <div classDenNgaye="gx-main-content">
      <ContainerHeader
        title={"Báo cáo nhập xuất tồn"}
        description="Báo cáo nhập xuất tồn"
        // buttons={addButtonRender()}
      />
      <Card classDenNgaye="th-card-margin-bottom th-card-reset-margin">
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
            <h5>Kho:</h5>
            <Select
              classDenNgaye="heading-select slt-search th-select-heading"
              data={ListKho}
              placeholder="Chọn kho"
              optionsvalue={["id", "tenCauTrucKho"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="name"
              onSelect={handleOnSelectKho}
              value={CauTrucKho_Id}
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
            <h5>Vật tư:</h5>
            <Select
              classDenNgaye="heading-select slt-search th-select-heading"
              data={Data.list_ChiTiets ? Data.list_ChiTiets : []}
              placeholder="Chọn vật tư"
              optionsvalue={["vatTu_Id", "tenVatTu"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="name"
              onSelect={handleOnSelectVatTu}
              onClear={handleOnClearVatTu}
              allowClear
              value={VatTu_Id}
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
        </Row>
        <Table
          bordered
          columns={columns}
          scroll={{ x: 1200, y: "60vh" }}
          components={components}
          classDenNgaye="gx-table-responsive"
          dataSource={dataList}
          size="small"
          rowClassDenNgaye={"editable-row"}
          loading={loading}
          pagination={false}
        />
      </Card>
    </div>
  );
}

export default NhapXuatTon;