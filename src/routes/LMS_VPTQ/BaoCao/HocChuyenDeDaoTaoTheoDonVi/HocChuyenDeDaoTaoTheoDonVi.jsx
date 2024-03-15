import React, { useEffect, useState } from "react";
import { Card, Row, Col, DatePicker, Button } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { map } from "lodash";
import { Table, EditableTableRow, Select } from "src/components/Common";
import { fetchStart, fetchReset } from "src/appRedux/actions/Common";
import {
  convertObjectToUrlParams,
  reDataForTable,
  removeDuplicates,
  getNgayDauThang,
  getNgayCuoiThang,
  exportExcel,
  getLocalStorage,
  getTokenInfo,
} from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";
import moment from "moment";
import { DownloadOutlined } from "@ant-design/icons";

const { RangePicker } = DatePicker;
const { EditableRow, EditableCell } = EditableTableRow;

function BaoCaoHocChuyenDeDaoTaoTheoDonVi({ history, permission }) {
  const { loading, width } = useSelector(({ common }) => common).toJS();
  const dispatch = useDispatch();
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };
  const [DataListUser, setDataListUser] = useState([]);
  const [DataListChuyenDe, setDataListChuyenDe] = useState([]);
  const [ListDonVi, setListDonVi] = useState([]);
  const [DonVi, setDonVi] = useState(null);
  const [TuNgay, setTuNgay] = useState(getNgayDauThang());
  const [DenNgay, setDenNgay] = useState(getNgayCuoiThang());

  useEffect(() => {
    if (permission && permission.view) {
      getListDonVi();
    } else if ((permission && !permission.view) || permission === undefined) {
      history.push("/home");
    }

    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getListData = (donVi_Id, tuNgay, denNgay) => {
    const param = convertObjectToUrlParams({
      donViHienHanh_Id: INFO.donVi_Id,
      donVi_Id,
      tuNgay,
      denNgay,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_BaoCao/bao-cao-hoc-chuyen-de-dao-tao-theo-don-vi?${param}`,
          "GET",
          null,
          "LIST",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res && res.status !== 409) {
          const data = res.data && res.data;
          const listuser = data.list_Users && JSON.parse(data.list_Users);

          setDataListUser(listuser);

          const listchuyende =
            data.list_ChuyenDeDaoTaos && JSON.parse(data.list_ChuyenDeDaoTaos);
          setDataListChuyenDe(listchuyende);
        } else {
          setDataListUser([]);
          setDataListChuyenDe([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getListDonVi = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `DonVi/don-vi-by-user`,
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
          setListDonVi(res.data);
          setDonVi(res.data[0].id);
          getListData(res.data[0].id, TuNgay, DenNgay);
        } else {
          setListDonVi([]);
          setDonVi(null);
          setDataListUser([]);
          setDataListChuyenDe([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const dataList = reDataForTable(DataListUser);

  const datalistChuyenDe = Array.from(
    new Set(
      dataList.flatMap((user) =>
        user.list_ChiTiets.map((chiTiet) => chiTiet.vptq_lms_ChuyenDeDaoTao_Id)
      )
    )
  ).map(
    (cd) =>
      DataListChuyenDe &&
      DataListChuyenDe.find(
        (chuyenDe) =>
          chuyenDe.vptq_lms_ChuyenDeDaoTao_Id.toLowerCase() === cd.toLowerCase()
      )
  );

  const list_ChuyenDes = datalistChuyenDe.map((chuyende) => ({
    title: chuyende && chuyende.tenChuyenDeDaoTao,
    dataIndex: chuyende && chuyende.vptq_lms_ChuyenDeDaoTao_Id.toLowerCase(),
    key: chuyende && chuyende.vptq_lms_ChuyenDeDaoTao_Id.toLowerCase(),
    width: 120,
    align: "center",
    render: (text, record) => {
      const chiTiet =
        record.list_ChiTiets &&
        record.list_ChiTiets.find(
          (chiTiet) =>
            (chiTiet && chiTiet.vptq_lms_ChuyenDeDaoTao_Id.toLowerCase()) ===
            (chuyende && chuyende.vptq_lms_ChuyenDeDaoTao_Id.toLowerCase())
        );
      return chiTiet ? chiTiet.soLanHoc : "-";
    },
  }));

  const totalCounts = {};

  DataListUser &&
    DataListUser.forEach((user) => {
      user.list_ChiTiets &&
        user.list_ChiTiets.forEach((chiTiet) => {
          const { soLanHoc, vptq_lms_ChuyenDeDaoTao_Id } = chiTiet;

          if (totalCounts[vptq_lms_ChuyenDeDaoTao_Id]) {
            totalCounts[vptq_lms_ChuyenDeDaoTao_Id] += soLanHoc;
          } else {
            totalCounts[vptq_lms_ChuyenDeDaoTao_Id] = soLanHoc;
          }
        });
    });

  const list_Tongs = Object.keys(totalCounts).map(
    (vptq_lms_ChuyenDeDaoTao_Id) => ({
      vptq_lms_ChuyenDeDaoTao_Id,
      soLanHoc: totalCounts[vptq_lms_ChuyenDeDaoTao_Id],
    })
  );

  const HangTong = {
    key: "Tổng",
    list_ChiTiets: list_Tongs && list_Tongs,
  };

  dataList.length && dataList.unshift(HangTong);

  let columnValues = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      align: "center",
      width: 50,
      fixed: width >= 1600 && "left",
      onCell: (record) => ({
        colSpan: record.key === "Tổng" ? 5 : 1,
      }),
    },
    {
      title: "Mã nhân viên",
      dataIndex: "maNhanVien",
      key: "maNhanVien",
      align: "center",
      width: 120,
      fixed: width >= 1600 && "left",
      filters: removeDuplicates(
        map(DataListUser, (d) => {
          return {
            text: d.maNhanVien,
            value: d.maNhanVien,
          };
        })
      ),
      onFilter: (value, record) =>
        record.maNhanVien && record.maNhanVien.includes(value),
      filterSearch: true,
      onCell: (record) => ({
        colSpan: record.key === "Tổng" ? 0 : 1,
      }),
    },
    {
      title: "Họ và tên",
      dataIndex: "fullName",
      key: "fullName",
      align: "left",
      width: 150,
      fixed: width >= 1600 && "left",
      filters: removeDuplicates(
        map(DataListUser, (d) => {
          return {
            text: d.fullName,
            value: d.fullName,
          };
        })
      ),
      onFilter: (value, record) =>
        record.fullName && record.fullName.includes(value),
      filterSearch: true,
      onCell: (record) => ({
        colSpan: record.key === "Tổng" ? 0 : 1,
      }),
    },
    {
      title: "Phòng ban",
      dataIndex: "tenPhongBan",
      key: "tenPhongBan",
      width: 150,
      fixed: width >= 1600 && "left",
      filters: removeDuplicates(
        map(DataListUser, (d) => {
          return {
            text: d.tenPhongBan,
            value: d.tenPhongBan,
          };
        })
      ),
      onFilter: (value, record) =>
        record.tenPhongBan && record.tenPhongBan.includes(value),
      filterSearch: true,
      onCell: (record) => ({
        colSpan: record.key === "Tổng" ? 0 : 1,
      }),
    },
    {
      title: "Đơn vị",
      dataIndex: "tenDonVi",
      key: "tenDonVi",
      width: 200,
      fixed: width >= 1600 && "left",
      filters: removeDuplicates(
        map(DataListUser, (d) => {
          return {
            text: d.tenDonVi,
            value: d.tenDonVi,
          };
        })
      ),
      onFilter: (value, record) =>
        record.tenDonVi && record.tenDonVi.includes(value),
      filterSearch: true,
      onCell: (record) => ({
        colSpan: record.key === "Tổng" ? 0 : 1,
      }),
    },
    ...list_ChuyenDes,
  ];

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  const columns = map(columnValues, (col) => {
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

  const handleXuatExcel = () => {
    const DataXuatExcel = {
      donVi_Id: DonVi,
      tuNgay: TuNgay,
      denNgay: DenNgay,
      list_ChuyenDeDaoTaos: DataListChuyenDe,
      list_Users: DataListUser,
    };
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_BaoCao/export-bao-cao-hoc-chuyen-de-dao-tao-theo-don-vi`,
          "POST",
          DataXuatExcel,
          "",
          "",
          resolve,
          reject
        )
      );
    }).then((res) => {
      if (res && res.data) {
        exportExcel(
          "BAO_CAO_HOC_CHUYEN_DE_DAO_TAO_THEO_DON_VI",
          res.data.dataexcel
        );
      }
    });
  };

  const addButtonRender = () => {
    return (
      <>
        <Button
          icon={<DownloadOutlined />}
          className="th-margin-bottom-0 btn-margin-bottom-0"
          type="primary"
          onClick={handleXuatExcel}
          disabled={DataListUser && DataListUser.length === 0}
        >
          Xuất Excel
        </Button>
      </>
    );
  };

  const handleOnSelectDonVi = (value) => {
    setDonVi(value);
    getListData(value, TuNgay, DenNgay);
  };

  const handleChangeNgay = (dateString) => {
    setTuNgay(dateString[0]);
    setDenNgay(dateString[1]);
    getListData(DonVi, dateString[0], dateString[1]);
  };

  return (
    <div className="gx-main-content">
      <ContainerHeader
        title="Báo cáo học chuyên đề đào tạo theo đơn vị"
        description="Báo cáo học chuyên đề đào tạo theo đơn vị"
        buttons={addButtonRender()}
      />
      <Card className="th-card-margin-bottom th-card-reset-margin">
        <Row>
          <Col
            xxl={6}
            xl={8}
            lg={12}
            md={12}
            sm={20}
            xs={24}
            style={{
              marginBottom: 8,
            }}
          >
            <span>Đơn vị:</span>
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListDonVi ? ListDonVi : []}
              placeholder="Chọn đơn vị"
              optionsvalue={["id", "tenDonVi"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="name"
              onSelect={handleOnSelectDonVi}
              value={DonVi}
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
            <span>Ngày dự kiến đào tạo:</span>
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
      </Card>
      <Card className="th-card-margin-bottom th-card-reset-margin">
        <Table
          bordered
          scroll={{ x: 1500, y: "52vh" }}
          columns={columns}
          components={components}
          className="gx-table-responsive th-table"
          dataSource={dataList}
          size="small"
          rowClassName={(record) =>
            record.key === "Tổng" ? "total-row" : "editable-row"
          }
          pagination={false}
          loading={loading}
        />
      </Card>
    </div>
  );
}

export default BaoCaoHocChuyenDeDaoTaoTheoDonVi;
