import { DownloadOutlined } from "@ant-design/icons";
import { Button, Card, Row, Col, DatePicker } from "antd";
import { map } from "lodash";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions/Common";
import { exportExcel, getDateNow, reDataForTable } from "src/util/Common";
import { EditableTableRow, Table, Select } from "src/components/Common";
import { useLocation } from "react-router-dom";
import ContainerHeader from "src/components/ContainerHeader";
import { convertObjectToUrlParams } from "src/util/Common";
import moment from "moment";
const { RangePicker } = DatePicker;
const { EditableRow, EditableCell } = EditableTableRow;
function SoChiTietVatTu({ permission, history, match }) {
  const dispatch = useDispatch();
  const { loading } = useSelector(({ common }) => common).toJS();
  // const INFO = { ...getLocalStorage("menu"), user_Id: getTokenInfo().id };
  const [Data, setData] = useState([]);
  const [TuNgay, setTuNgay] = useState(getDateNow(-14));
  const [DenNgay, setDenNgay] = useState(getDateNow());
  const [CauTrucKho_Id, setCauTrucKho_Id] = useState("");
  const [ListKho, setListKho] = useState([]);
  const [ListVatTu, setListVatTu] = useState([]);

  const [VatTu_Id, setVatTu_Id] = useState("");
  const location = useLocation();

  useEffect(() => {
    if (
      permission &&
      permission.view &&
      location.state &&
      location.state.itemData
    ) {
      const data = location.state.itemData;
      setCauTrucKho_Id(data.cauTrucKho_Id);
      setVatTu_Id(data.vatTu_Id);
      setTuNgay(data.tuNgay);
      setDenNgay(data.denNgay);
      setListVatTu([{ id: data.vatTu_Id, tenVatTu: data.tenVatTu }]);
      getListData(data.tuNgay, data.denNgay, data.cauTrucKho_Id, data.vatTu_Id);
      getKho();
    } else if ((permission && !permission.view) || permission === undefined) {
      history.push("/home");
    }
    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getListData = (TuNgay, DenNgay, CauTrucKho_Id, VatTu_Id) => {
    let param = convertObjectToUrlParams({
      TuNgay,
      DenNgay,
      CauTrucKho_Id,
      VatTu_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_BaoCao/bao-cao-so-chi-tiet-vat-tu?${param}`,
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
          const list = [
            {
              thongTin: "Tồn đầu kỳ",
              soLuongTon: res.data.soLuongTonDauKy,
            },
          ];
          list.push(
            ...res.data.list_ChiTiets,
            ...[
              {
                thongTin: "Tổng nhập/xuất trong kỳ",
                soLuongNhap: res.data.tongSoLuongNhap,
                soLuongXuat: res.data.tongSoLuongXuat,
              },
              {
                thongTin: "Tồn cuối kỳ",
                soLuongTon: res.data.soLuongTonCuoiKy,
              },
            ]
          );
          res.data.list_ChiTiets = list;
          setData(res.data);
        }
      })
      .catch((error) => console.error(error));
  };
  const getKho = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `CauTrucKho/cau-truc-kho-by-thu-tu?thutu=1&&isThanhPham=false`,
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
        } else {
          setListKho([]);
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
  const dataList = reDataForTable(Data.list_ChiTiets);
  let colValues = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      width: 50,
      align: "center",
    },
    {
      title: "Chứng từ",
      key: "chungTu",
      align: "center",
      children: [
        {
          title: "Số",
          dataIndex: "maPhieu",
          key: "maPhieu",
          align: "center",
        },
        {
          title: "Ngày",
          dataIndex: "ngayTao",
          key: "ngayTao",
          align: "center",
        },
      ],
    },
    {
      title: "Diễn giải",
      dataIndex: "thongTin",
      key: "thongTin",
      align: "center",
      width: 250,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.thongTin,
            value: d.thongTin,
          };
        })
      ),
      onFilter: (value, record) => record.thongTin.includes(value),
      filterSearch: true,
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
      title: "Nhập",
      dataIndex: "soLuongNhap",
      key: "soLuongNhap",
      align: "center",
    },
    {
      title: "Xuất",
      dataIndex: "soLuongXuat",
      key: "soLuongXuat",
      align: "center",
    },
    {
      title: "Tồn",
      dataIndex: "soLuongTon",
      key: "soLuongTon",
      align: "center",
    },
    {
      title: "Bên giao",
      key: "benGiao",
      align: "center",
      children: [
        {
          title: "Mã đối tác",
          dataIndex: "maDoiTac",
          key: "maDoiTac",
          align: "center",
        },
        {
          title: "Tên đối tác",
          dataIndex: "tenDoiTac",
          key: "tenDoiTac",
          align: "center",
        },
      ],
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
      tuNgay: TuNgay,
      denNgay: DenNgay,
      cauTrucKho_Id: CauTrucKho_Id,
      tenKho: Data.tenKho,
      maKho: Data.maKho,
      vatTu_Id: Data.vatTu_Id,
      maVatTu: Data.maVatTu,
      tenVatTu: Data.tenVatTu,
      soLuongTonDauKy: Data.soLuongTonDauKy,
      soLuongTonCuoiKy: Data.soLuongTonCuoiKy,
      tongSoLuongNhap: Data.tongSoLuongNhap,
      tongSoLuongXuat: Data.tongSoLuongXuat,
      list_ChiTiets: Data.list_ChiTiets,
    };
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_BaoCao/export-file-so-chi-tiet-vat-tu`,
          "POST",
          newData,
          "",
          "",
          resolve,
          reject
        )
      );
    }).then((res) => {
      exportExcel(`BaoCaoNhapXuatTon`, res.data.dataexcel);
    });
  };

  const addButtonRender = () => {
    return (
      <>
        <Button
          icon={<DownloadOutlined />}
          classDenNgaye="th-btn-margin-bottom-0"
          type="primary"
          onClick={XuatExcel}
          disabled={permission && !permission.add}
        >
          Xuất excel
        </Button>
      </>
    );
  };

  const handleOnSelectKho = (value) => {
    setCauTrucKho_Id(value);
    getListData(TuNgay, DenNgay, value, VatTu_Id);
  };
  const handleOnSelectVatTu = (value) => {
    setVatTu_Id(value);
    getListData(TuNgay, DenNgay, CauTrucKho_Id, value);
  };

  const handleChangeNgay = (dateString) => {
    setTuNgay(dateString[0]);
    setDenNgay(dateString[1]);
    getListData(dateString[0], dateString[1], CauTrucKho_Id, VatTu_Id);
  };
  const goBack = () => {
    history.push(match.url.replace("/so-chi-tiet-vat-tu", ""));
  };
  return (
    <div classDenNgaye="gx-main-content">
      <ContainerHeader
        title={"Báo cáo sổ chi tiết vật tư"}
        description="Báo cáo sổ chi tiết vật tư"
        buttons={addButtonRender()}
        back={goBack}
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
            <h5>Kho:</h5>
            <Select
              classDenNgaye="heading-select slt-search th-select-heading"
              data={ListKho}
              placeholder="Chọn kho"
              optionsvalue={["id", "tenCTKho"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="DenNgaye"
              onSelect={handleOnSelectKho}
              value={CauTrucKho_Id}
              disabled={true}
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
            <h5>Vật tư:</h5>
            <Select
              classDenNgaye="heading-select slt-search th-select-heading"
              data={ListVatTu ? ListVatTu : []}
              placeholder="Chọn vật tư"
              optionsvalue={["id", "tenVatTu"]}
              style={{ width: "100%" }}
              onSelect={handleOnSelectVatTu}
              value={VatTu_Id}
              disabled={true}
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
          scroll={{ x: 1200, y: "55vh" }}
          components={components}
          classDenNgaye="gx-table-responsive"
          dataSource={dataList}
          size="small"
          rowClassDenNgaye={"editable-row"}
          loading={loading}
          pagination={{
            pageSize: 20,
            total: Data && Data.list_ChiTiets && Data.list_ChiTiets.length,
            showSizeChanger: false,
            showQuickJumper: true,
          }}
        />
      </Card>
    </div>
  );
}

export default SoChiTietVatTu;
