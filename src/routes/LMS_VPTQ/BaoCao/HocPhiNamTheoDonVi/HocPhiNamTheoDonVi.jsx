import React, { useEffect, useState } from "react";
import { Card, Row, Col, Button, DatePicker, Modal as AntModal } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { map } from "lodash";
import { Table, EditableTableRow } from "src/components/Common";
import { fetchStart, fetchReset } from "src/appRedux/actions/Common";
import {
  convertObjectToUrlParams,
  reDataForTable,
  removeDuplicates,
  exportExcel,
  getNamNow,
} from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";
import moment from "moment";
import { DownloadOutlined } from "@ant-design/icons";
import numeral from "numeral";

const { EditableRow, EditableCell } = EditableTableRow;

function BaoCaoHocPhiNamTheoDonVi({ history, permission }) {
  const { loading, width } = useSelector(({ common }) => common).toJS();
  const dispatch = useDispatch();
  const [DataBaoCao, setDataBaoCao] = useState([]);
  const [ListDataChiTiet, setListDataChiTiet] = useState([]);
  const [ActiveModalChiTiet, setActiveModalChiTiet] = useState(false);
  const [Nam, setNam] = useState(getNamNow());
  const [Thang, setThang] = useState(null);
  const [TenDonVi, setTenDonVi] = useState(null);

  useEffect(() => {
    if (permission && permission.view) {
      getListData(Nam);
    } else if ((permission && !permission.view) || permission === undefined) {
      history.push("/home");
    }

    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getListData = (nam) => {
    const param = convertObjectToUrlParams({
      nam,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_BaoCao/bao-cao-hoc-phi-nam-theo-don-vi?${param}`,
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
                  [`thang${chiTiet.thang}`]: chiTiet.hocPhi,
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

  const dataList = reDataForTable(DataBaoCao);

  const tongHocPhi = {};

  for (let month = 1; month <= 12; month++) {
    tongHocPhi[`thang${month}`] = dataList.reduce((sum, item) => {
      return sum + (item[`thang${month}`] || 0);
    }, 0);
  }

  const total = dataList.reduce((sum, item) => {
    return sum + (item.tongHocPhi || 0);
  }, 0);

  const HangTong = {
    key: "Tổng",
    tongHocPhi: total,
    ...tongHocPhi,
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
          `vptq_lms_BaoCao/bao-cao-hoc-phi-nam-theo-don-vi/${item.donVi_Id}?${param}`,
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
        const datathang = `thang${month}`;
        return {
          title: `Tháng ${month}`,
          dataIndex: datathang,
          key: datathang,
          align: "center",
          width: 135,
          render: (value, record) => {
            return !value ? (
              "-"
            ) : (
              <span
                onClick={() => handleChiTiet(month, record)}
                style={{ cursor: "pointer" }}
              >
                {numeral(value).format("0,0 VNĐ")} (VNĐ)
              </span>
            );
          },
        };
      }),
    },
    {
      title: "Tổng học phí",
      dataIndex: "tongHocPhi",
      key: "tongHocPhi",
      align: "center",
      width: 150,
      fixed: "right",
      render: (value) => {
        return (
          <span className="total-row">
            {numeral(value).format("0,0 VNĐ")} (VNĐ)
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
      title: "Học phí",
      dataIndex: "hocPhi",
      key: "hocPhi",
      align: "center",
      width: 130,
      render: (value) => {
        return <span>{numeral(value).format("0,0 VNĐ")} (VNĐ)</span>;
      },
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
      nam: Nam,
      list_DonVis: DataBaoCao,
    };
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_BaoCao/export-bao-cao-hoc-phi-nam-theo-don-vi`,
          "POST",
          DataXuatExcel,
          "",
          "",
          resolve,
          reject
        )
      );
    }).then((res) => {
      exportExcel("BAO_CAO_HOC_PHI_NAM_THEO_DON_VI", res.data.dataexcel);
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

  const handleChangeYear = (year) => {
    setNam(year);
    getListData(year);
  };

  return (
    <div className="gx-main-content">
      <ContainerHeader
        title="Báo cáo học phí năm theo đơn vị"
        description="Báo cáo học phí năm theo đơn vị"
        buttons={addButtonRender()}
      />
      <Card className="th-card-margin-bottom th-card-reset-margin">
        <Row style={{ padding: "0px 10px" }}>
          <Col
            xxl={6}
            xl={8}
            lg={12}
            md={12}
            sm={24}
            xs={24}
            style={{ display: "flex", alignItems: "center", marginBottom: 8 }}
          >
            <span style={{ width: "50px" }}>Năm:</span>
            <DatePicker
              format={"YYYY"}
              picker="year"
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
          scroll={{ x: 1900, y: "50vh" }}
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
        title={`CHI TIẾT HỌC PHÍ ĐƠN VỊ ${
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

export default BaoCaoHocPhiNamTheoDonVi;
