import React, { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Button,
  DatePicker,
  Modal as AntModal,
  Tag,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import { includes, map } from "lodash";
import { Table, EditableTableRow, Select } from "src/components/Common";
import { fetchStart, fetchReset } from "src/appRedux/actions/Common";
import {
  convertObjectToUrlParams,
  reDataForTable,
  removeDuplicates,
  exportExcel,
  getNamNow,
  getTokenInfo,
  getLocalStorage,
} from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";
import moment from "moment";
import { DownloadOutlined, ExportOutlined } from "@ant-design/icons";

const { EditableRow, EditableCell } = EditableTableRow;

function BaoCaoDaoTaoNamTheoDonVi({ history, permission }) {
  const { loading, width } = useSelector(({ common }) => common).toJS();
  const dispatch = useDispatch();
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };
  const [DataBaoCao, setDataBaoCao] = useState([]);
  const [ListDataChiTiet, setListDataChiTiet] = useState([]);
  const [ActiveModalChiTiet, setActiveModalChiTiet] = useState(false);
  const [ListHinhThucDaoTao, setListHinhThucDaoTao] = useState([]);
  const [HinhThucDaoTao, setHinhThucDaoTao] = useState(null);
  const [Nam, setNam] = useState(getNamNow());
  const [Thang, setThang] = useState(null);
  const [DonVi, setDonVi] = useState(null);
  const [TenDonVi, setTenDonVi] = useState(null);

  useEffect(() => {
    if (permission && permission.view) {
      getListHinhThucDaoTao();
      getListData(HinhThucDaoTao, Nam);
    } else if ((permission && !permission.view) || permission === undefined) {
      history.push("/home");
    }

    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getListData = (vptq_lms_HinhThucDaoTao_Id, nam) => {
    const param = convertObjectToUrlParams({
      donViHienHanh_Id: INFO.donVi_Id,
      vptq_lms_HinhThucDaoTao_Id,
      nam,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_BaoCao/bao-cao-dao-tao-nam-theo-don-vi?${param}`,
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
          const newData = data.map((dt) => {
            const chiTiet =
              dt.list_ChiTiets &&
              JSON.parse(dt.list_ChiTiets).map((chiTiet) => {
                return {
                  [`soLuongHoanThanh${chiTiet.thang}`]:
                    chiTiet.soLuongHoanThanh,
                  [`soLuongHocVien${chiTiet.thang}`]: chiTiet.soLuongHocVien,
                };
              });

            return {
              ...dt,
              list_ChiTiets: dt.list_ChiTiets && JSON.parse(dt.list_ChiTiets),
              ...chiTiet.reduce((acc, val) => Object.assign(acc, val), {}),
            };
          });

          setDataBaoCao(newData);
        } else {
          setDataBaoCao([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getListHinhThucDaoTao = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_HinhThucDaoTao?page=-1`,
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
        if (res && res.data) {
          setListHinhThucDaoTao(res.data);
        } else {
          setListHinhThucDaoTao([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const dataList = reDataForTable(DataBaoCao);

  const tong = {};
  for (let month = 1; month <= 12; month++) {
    tong[`soLuongHoanThanh${month}`] = dataList.reduce((sum, item) => {
      return sum + (item[`soLuongHoanThanh${month}`] || 0);
    }, 0);
    tong[`soLuongHocVien${month}`] = dataList.reduce((sum, item) => {
      return sum + (item[`soLuongHocVien${month}`] || 0);
    }, 0);
  }

  const totalSoLuongHoanThanh = dataList.reduce((sum, item) => {
    return sum + (item.tongSoLuongHoanThanh || 0);
  }, 0);

  const totalSoLuongHocVien = dataList.reduce((sum, item) => {
    return sum + (item.tongSoLuongHocVien || 0);
  }, 0);

  const HangTong = {
    key: "Tổng",
    tongSoLuongHoanThanh: totalSoLuongHoanThanh,
    tongSoLuongHocVien: totalSoLuongHocVien,
    ...tong,
  };

  dataList.length && dataList.push(HangTong);

  const handleChiTiet = (thang, item) => {
    const param = convertObjectToUrlParams({
      thang: thang,
      nam: Nam,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_BaoCao/bao-cao-dao-tao-nam-theo-don-vi/${item.donVi_Id}?${param}`,
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
        if (res && res.data) {
          setListDataChiTiet(res.data);
        } else {
          setListDataChiTiet([]);
        }
      })
      .catch((error) => console.error(error));
    setThang(thang);
    setDonVi(item.donVi_Id);
    setTenDonVi(item.tenDonVi);
    setActiveModalChiTiet(true);
  };

  let columnValues = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      align: "center",
      width: 50,
      fixed: width >= 1600 && "left",
      onCell: (record) => ({
        colSpan: record.key === "Tổng" ? 2 : 1,
      }),
    },
    {
      title: "Đơn vị",
      dataIndex: "tenDonVi",
      key: "tenDonVi",
      align: "left",
      width: 250,
      fixed: width >= 1600 && "left",
      filters: removeDuplicates(
        map(DataBaoCao, (d) => {
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
    {
      title: `Năm ${getNamNow()}`,
      align: "center",
      children: Array.from({ length: 12 }, (_, index) => {
        const month = index + 1;

        const dataSoLuongHoanThanh = `soLuongHoanThanh${month}`;
        const dataSoLuongHocVien = `soLuongHocVien${month}`;

        return {
          title: `Tháng ${month}`,
          align: "center",
          width: 100,
          render: (record) => {
            return (record.key === "Tổng" &&
              record[dataSoLuongHoanThanh] === 0 &&
              record[dataSoLuongHoanThanh] === 0) ||
              (record[dataSoLuongHoanThanh] === undefined &&
                record[dataSoLuongHoanThanh] === undefined) ? (
              "-"
            ) : (
              <span
                onClick={() => handleChiTiet(month, record)}
                style={{ cursor: "pointer" }}
              >
                {record[dataSoLuongHoanThanh]}/{record[dataSoLuongHocVien]}
              </span>
            );
          },
        };
      }),
    },
    {
      title: "Tổng",
      align: "center",
      width: 100,
      fixed: "right",
      render: (record) => {
        return (
          <span className="total-row">
            {record.tongSoLuongHoanThanh}/{record.tongSoLuongHocVien}
          </span>
        );
      },
    },
  ];

  let columnValuesChiTiet = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      align: "center",
      width: 50,
    },
    {
      title: "Mã nhân viên",
      dataIndex: "maNhanVien",
      key: "maNhanVien",
      align: "center",
      width: 120,
    },
    {
      title: "Họ và tên",
      dataIndex: "fullName",
      key: "fullName",
      align: "left",
      width: 150,
    },
    {
      title: "Chuyên đề đào tạo",
      dataIndex: "tenChuyenDeDaoTao",
      key: "tenChuyenDeDaoTao",
      align: "left",
      width: 200,
    },
    {
      title: (
        <div>
          Thời gian
          <br />
          đào tạo
        </div>
      ),
      dataIndex: "thoiGianDaoTao",
      key: "thoiGianDaoTao",
      align: "center",
      width: 100,
    },
    {
      title: (
        <div>
          Thời gian
          <br />
          kết thúc
        </div>
      ),
      dataIndex: "thoiGianKetThuc",
      key: "thoiGianKetThuc",
      align: "center",
      width: 100,
    },
    {
      title: (
        <div>
          Thời lượng
          <br />
          đào tạo
        </div>
      ),
      dataIndex: "thoiLuongDaoTao",
      key: "thoiLuongDaoTao",
      align: "center",
      width: 100,
      render: (value) => {
        return value && <span>{value} phút</span>;
      },
    },
    {
      title: "Lớp đào tạo",
      dataIndex: "tenLopHoc",
      key: "tenLopHoc",
      align: "left",
      width: 150,
    },
    {
      title: "Giảng viên",
      dataIndex: "tenGiangVien",
      key: "tenGiangVien",
      align: "left",
      width: 150,
    },
    {
      title: "Hình thức đào tạo",
      dataIndex: "tenHinhThucDaoTao",
      key: "tenHinhThucDaoTao",
      align: "left",
      width: 130,
    },
    {
      title: "Địa điểm đào tạo",
      dataIndex: "diaDiem",
      key: "diaDiem",
      align: "left",
      width: 120,
    },
    {
      title: "Trạng thái",
      dataIndex: "trangThai",
      key: "trangThai",
      align: "center",
      width: 130,
      render: (value) =>
        value && (
          <Tag
            color={
              value === "Hoàn thành"
                ? "blue"
                : value === "Chưa học"
                ? "orange"
                : includes(value, "Đã học")
                ? "green"
                : "red"
            }
            style={{
              whiteSpace: "break-spaces",
              fontSize: 13,
            }}
          >
            {value}
          </Tag>
        ),
    },
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
      vptq_lms_HinhThucDaoTao_Id: HinhThucDaoTao,
      nam: Nam,
      list_DonVis: DataBaoCao,
    };
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_BaoCao/export-bao-cao-dao-tao-nam-theo-don-vi`,
          "POST",
          DataXuatExcel,
          "",
          "",
          resolve,
          reject
        )
      );
    }).then((res) => {
      exportExcel("BAO_CAO_DAO_TAO_NAM_THEO_DON_VI", res.data.dataexcel);
    });
  };

  const addButtonRender = () => {
    return (
      <>
        <Button
          icon={<DownloadOutlined />}
          className="th-margin-bottom-0"
          type="primary"
          onClick={handleXuatExcel}
          disabled={DataBaoCao && DataBaoCao.length === 0}
        >
          Xuất Excel
        </Button>
      </>
    );
  };

  const handleXuatExcelChiTiet = () => {
    const DataXuatExcelChiTiet = {
      vptq_lms_HinhThucDaoTao_Id: HinhThucDaoTao,
      donVi_Id: DonVi,
      thang: Thang,
      nam: Nam,
      list_ChiTiets: ListDataChiTiet,
    };
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_BaoCao/export-bao-cao-dao-tao-nam-theo-don-vi/${DonVi}`,
          "POST",
          DataXuatExcelChiTiet,
          "",
          "",
          resolve,
          reject
        )
      );
    }).then((res) => {
      exportExcel(
        "BAO_CAO_CHI_TIET_DAO_TAO_NAM_THEO_DON_VI",
        res.data.dataexcel
      );
    });
  };

  const handleSelectHinhThucDaoTao = (value) => {
    setHinhThucDaoTao(value);
    getListData(value, Nam);
  };

  const handleClearHinhThucDaoTao = () => {
    setHinhThucDaoTao(null);
    getListData(null, Nam);
  };

  const handleChangeYear = (year) => {
    setNam(year);
    getListData(HinhThucDaoTao, year);
  };

  return (
    <div className="gx-main-content">
      <ContainerHeader
        title="Báo cáo đào tạo năm theo đơn vị"
        description="Báo cáo đào tạo năm theo đơn vị"
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
            <span>Hình thức đào tạo:</span>
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListHinhThucDaoTao ? ListHinhThucDaoTao : []}
              placeholder="Chọn hình thức đào tạo"
              optionsvalue={["id", "tenHinhThucDaoTao"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="name"
              onSelect={handleSelectHinhThucDaoTao}
              allowClear
              onClear={handleClearHinhThucDaoTao}
              value={HinhThucDaoTao}
            />
          </Col>
          <Col
            xxl={6}
            xl={8}
            lg={12}
            md={12}
            sm={24}
            xs={24}
            style={{
              display: "flex",
              flexDirection: "column",
              marginBottom: 8,
            }}
          >
            <span>Năm:</span>
            <DatePicker
              format={"YYYY"}
              picker="year"
              style={{ width: "50%" }}
              onChange={(date, year) => handleChangeYear(year)}
              defaultValue={moment(Nam, "YYYY")}
              allowClear={false}
            />
          </Col>
        </Row>
      </Card>
      <Card className="th-card-margin-bottom th-card-reset-margin">
        <Table
          bordered
          scroll={{ x: 1600, y: "50vh" }}
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
      <AntModal
        title={`CHI TIẾT ĐÀO TẠO ĐƠN VỊ ${
          TenDonVi && TenDonVi
        } (THÁNG ${Thang}/${Nam})`}
        className="th-card-reset-margin"
        open={ActiveModalChiTiet}
        width={width >= 1600 ? `85%` : "100%"}
        closable={true}
        onCancel={() => {
          setActiveModalChiTiet(false);
          setListDataChiTiet([]);
        }}
        footer={null}
      >
        <Card className="th-card-margin-bottom th-card-reset-margin">
          <div align={"end"} style={{ marginBottom: "10px" }}>
            <Button
              icon={<ExportOutlined />}
              className="th-margin-bottom-0"
              onClick={() => handleXuatExcelChiTiet()}
              type="primary"
            >
              Xuất excel
            </Button>
          </div>
          <Table
            bordered
            scroll={{ x: 1500, y: "50vh" }}
            columns={columnValuesChiTiet}
            components={components}
            className="gx-table-responsive th-table"
            dataSource={reDataForTable(ListDataChiTiet)}
            size="small"
            rowClassName={(record) =>
              record.key === "Tổng" ? "total-row" : "editable-row"
            }
            pagination={false}
            loading={loading}
          />
        </Card>
      </AntModal>
    </div>
  );
}

export default BaoCaoDaoTaoNamTheoDonVi;
