import React, { useEffect, useState } from "react";
import { Card, Row, Col, Button, DatePicker, Modal as AntModal } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { isEmpty, map } from "lodash";
import {
  Table,
  EditableTableRow,
  Select,
  Toolbar,
} from "src/components/Common";
import { fetchStart, fetchReset } from "src/appRedux/actions/Common";
import {
  convertObjectToUrlParams,
  reDataForTable,
  removeDuplicates,
  exportExcel,
  getNgayDauThang,
  getNgayCuoiThang,
  getTokenInfo,
  getLocalStorage,
} from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";
import moment from "moment";
import { DownloadOutlined, SearchOutlined } from "@ant-design/icons";
import numeral from "numeral";

const { RangePicker } = DatePicker;
const { EditableRow, EditableCell } = EditableTableRow;

function BaoCaoHocPhiTheoDonVi({ history, permission }) {
  const { loading, width } = useSelector(({ common }) => common).toJS();
  const dispatch = useDispatch();
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };
  const [DataBaoCao, setDataBaoCao] = useState([]);
  const [DataChiTiet, setDataChiTiet] = useState(null);
  const [ListDataChiTiet, setListDataChiTiet] = useState([]);
  const [ActiveModalChiTiet, setActiveModalChiTiet] = useState(false);
  const [ListDonVi, setListDonVi] = useState([]);
  const [DonVi, setDonVi] = useState(null);
  const [ListChuyenDeDaoTao, setListChuyenDeDaoTao] = useState([]);
  const [ChuyenDeDaoTao, setChuyenDeDaoTao] = useState(null);
  const [Keyword, setKeyword] = useState(null);
  const [TuNgay, setTuNgay] = useState(getNgayDauThang());
  const [DenNgay, setDenNgay] = useState(getNgayCuoiThang());

  useEffect(() => {
    if (permission && permission.view) {
      getDataFilter(DonVi, TuNgay, DenNgay);
      getListData(DonVi, ChuyenDeDaoTao, Keyword, TuNgay, DenNgay);
    } else if ((permission && !permission.view) || permission === undefined) {
      history.push("/home");
    }

    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getListData = (
    donVi_Id,
    vptq_lms_ChuyenDeDaoTao_Id,
    keyword,
    tuNgay,
    denNgay
  ) => {
    const param = convertObjectToUrlParams({
      donViHienHanh_Id: INFO.donVi_Id,
      donVi_Id,
      vptq_lms_ChuyenDeDaoTao_Id,
      keyword,
      tuNgay,
      denNgay,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_BaoCao/bao-cao-hoc-phi-theo-don-vi?${param}`,
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
          setDataBaoCao(data);
        } else {
          setDataBaoCao([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getDataFilter = (donVi_Id, tuNgay, denNgay) => {
    const param = convertObjectToUrlParams({
      donViHienHanh_Id: INFO.donVi_Id,
      donVi_Id,
      tuNgay,
      denNgay,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_BaoCao/filter-bao-cao-hoc-phi-theo-don-vi?${param}`,
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
          const donvi = data.list_DonVis && JSON.parse(data.list_DonVis);
          setListDonVi(donvi);

          const chuyendedaotao =
            data.list_ChuyenDes && JSON.parse(data.list_ChuyenDes);
          setListChuyenDeDaoTao(chuyendedaotao);
        } else {
          setListDonVi([]);
          setListChuyenDeDaoTao([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const dataList = reDataForTable(DataBaoCao);

  const tongHocPhi = dataList.reduce(
    (total, item) => total + (item.tongHocPhi || 0),
    0
  );

  const HangTong = {
    key: "Tổng",
    tenDonVi: tongHocPhi,
  };

  dataList.length && dataList.push(HangTong);

  const handleChiTiet = (item) => {
    const chitiet = item.list_ChiTiets && JSON.parse(item.list_ChiTiets);
    setDataChiTiet(item);
    setListDataChiTiet(chitiet);
    setActiveModalChiTiet(true);
  };

  const actionContent = (item) => {
    const detailItem =
      permission && permission.del && !item.isUsed
        ? { onClick: () => handleChiTiet(item) }
        : { disabled: true };

    return item.key === "Tổng" ? (
      <span>{item.key}</span>
    ) : (
      <div>
        <React.Fragment>
          <a {...detailItem} title="Xem chi tiết">
            <SearchOutlined />
          </a>
        </React.Fragment>
      </div>
    );
  };

  let columnValues = [
    {
      title: "Chức năng",
      key: "action",
      align: "center",
      width: 80,
      render: (value) => actionContent(value),
      fixed: "left",
      onCell: (record) => ({
        colSpan: record.key === "Tổng" ? 3 : 1,
      }),
    },
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      align: "center",
      width: 50,
      onCell: (record) => ({
        colSpan: record.key === "Tổng" ? 0 : 1,
      }),
    },
    {
      title: "Chuyên đề đào tạo",
      dataIndex: "tenChuyenDeDaoTao",
      key: "tenChuyenDeDaoTao",
      align: "left",
      width: 250,
      filters: removeDuplicates(
        map(DataBaoCao, (d) => {
          return {
            text: d.tenChuyenDeDaoTao,
            value: d.tenChuyenDeDaoTao,
          };
        })
      ),
      onFilter: (value, record) =>
        record.tenChuyenDeDaoTao && record.tenChuyenDeDaoTao.includes(value),
      filterSearch: true,
      onCell: (record) => ({
        colSpan: record.key === "Tổng" ? 0 : 1,
      }),
    },
    {
      title: "Đơn vị",
      dataIndex: "tenDonVi",
      key: "tenDonVi",
      width: 250,
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
        colSpan: record.key === "Tổng" ? 4 : 1,
        align: record.key === "Tổng" ? "right" : "left",
      }),
      render: (value, record) => {
        return record.key === "Tổng" ? (
          <span>{numeral(value).format("0,0 VNĐ")} (VNĐ)</span>
        ) : (
          <span>{value}</span>
        );
      },
    },
    {
      title: "Giảng viên",
      dataIndex: "tenGiangVien",
      key: "tenGiangVien",
      align: "left",
      width: 150,
      filters: removeDuplicates(
        map(DataBaoCao, (d) => {
          return {
            text: d.tenGiangVien,
            value: d.tenGiangVien,
          };
        })
      ),
      onFilter: (value, record) =>
        record.tenGiangVien && record.tenGiangVien.includes(value),
      filterSearch: true,
      onCell: (record) => ({
        colSpan: record.key === "Tổng" ? 0 : 1,
      }),
    },
    {
      title: "Hình thức đào tạo",
      dataIndex: "tenHinhThucDaoTao",
      key: "tenHinhThucDaoTao",
      align: "left",
      width: 150,
      filters: removeDuplicates(
        map(DataBaoCao, (d) => {
          return {
            text: d.tenHinhThucDaoTao,
            value: d.tenHinhThucDaoTao,
          };
        })
      ),
      onFilter: (value, record) =>
        record.tenHinhThucDaoTao && record.tenHinhThucDaoTao.includes(value),
      filterSearch: true,
      onCell: (record) => ({
        colSpan: record.key === "Tổng" ? 0 : 1,
      }),
    },
    {
      title: "Học phí",
      dataIndex: "tongHocPhi",
      key: "tongHocPhi",
      align: "center",
      width: 150,
      filters: removeDuplicates(
        map(DataBaoCao, (d) => {
          return {
            text: d.tongHocPhi,
            value: d.tongHocPhi,
          };
        })
      ),
      onFilter: (value, record) =>
        record.tongHocPhi && record.tongHocPhi.includes(value),
      filterSearch: true,
      render: (value) => {
        return <span>{numeral(value).format("0,0 VNĐ")} (VNĐ)</span>;
      },
      onCell: (record) => ({
        colSpan: record.key === "Tổng" ? 0 : 1,
      }),
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
      width: 180,
    },
    {
      title: "Lớp đào tạo",
      dataIndex: "tenLopHoc",
      key: "tenLopHoc",
      align: "left",
      width: 180,
      render: (value) => {
        return value && <span>{value}</span>;
      },
    },
    {
      title: "Giảng viên",
      dataIndex: "tenGiangVien",
      key: "tenGiangVien",
      align: "left",
      width: 150,
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
      title: "Học phí",
      dataIndex: "hocPhi",
      key: "hocPhi",
      align: "center",
      width: 120,
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
      donVi_Id: DonVi,
      vptq_lms_ChuyenDeDaoTao_Id: ChuyenDeDaoTao,
      keyword: Keyword,
      tuNgay: TuNgay,
      denNgay: DenNgay,
      list_ChiTiets: DataBaoCao,
    };
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_BaoCao/export-bao-cao-hoc-phi-theo-don-vi`,
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
        exportExcel("BAO_CAO_HOC_PHI_THEO_DON_VI", res.data.dataexcel);
      }
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

  const handleOnSelectDonVi = (value) => {
    setDonVi(value);
    setChuyenDeDaoTao(null);
    getDataFilter(value, TuNgay, DenNgay);
    getListData(value, null, Keyword, TuNgay, DenNgay);
  };

  const handleClearDonVi = () => {
    setDonVi(null);
    setChuyenDeDaoTao(null);
    getDataFilter(null, TuNgay, DenNgay);
    getListData(null, null, Keyword, TuNgay, DenNgay);
  };

  const handleOnSelectChuyenDeDaoTao = (value) => {
    setChuyenDeDaoTao(value);
    getListData(DonVi, value, Keyword, TuNgay, DenNgay);
  };

  const handleClearChuyenDeDaoTao = () => {
    setChuyenDeDaoTao(null);
    getListData(DonVi, null, Keyword, TuNgay, DenNgay);
  };

  const onSearchBaoCao = () => {
    getListData(DonVi, ChuyenDeDaoTao, Keyword, TuNgay, DenNgay);
  };

  const onChangeKeyword = (val) => {
    setKeyword(val.target.value);
    if (isEmpty(val.target.value)) {
      getListData(DonVi, ChuyenDeDaoTao, val.target.value, TuNgay, DenNgay);
    }
  };

  const handleChangeNgay = (dateString) => {
    setTuNgay(dateString[0]);
    setDenNgay(dateString[1]);
    setDonVi(null);
    setChuyenDeDaoTao(null);
    getDataFilter(null, dateString[0], dateString[1]);
    getListData(DonVi, ChuyenDeDaoTao, Keyword, dateString[0], dateString[1]);
  };

  return (
    <div className="gx-main-content">
      <ContainerHeader
        title="Báo cáo học phí theo đơn vị"
        description="Báo cáo học phí theo đơn vị"
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
              optionsvalue={["donVi_Id", "tenDonVi"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="name"
              onSelect={handleOnSelectDonVi}
              allowClear
              onClear={handleClearDonVi}
              value={DonVi}
            />
          </Col>
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
            <span>Chuyên đề đào tạo:</span>
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListChuyenDeDaoTao ? ListChuyenDeDaoTao : []}
              placeholder="Chọn chuyên đề đào tạo"
              optionsvalue={["vptq_lms_ChuyenDeDaoTao_Id", "tenChuyenDeDaoTao"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="name"
              onSelect={handleOnSelectChuyenDeDaoTao}
              allowClear
              onClear={handleClearChuyenDeDaoTao}
              value={ChuyenDeDaoTao}
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
            <span>Tìm kiếm:</span>
            <Toolbar
              count={1}
              search={{
                title: "Tìm kiếm",
                loading,
                value: Keyword,
                onChange: onChangeKeyword,
                onPressEnter: onSearchBaoCao,
                onSearch: onSearchBaoCao,
                placeholder: "Nhập từ khóa",
                allowClear: true,
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
          scroll={{ x: 1100, y: "52vh" }}
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
        title={`CHI TIẾT HỌC PHÍ ĐƠN VỊ ${DataChiTiet && DataChiTiet.tenDonVi}`}
        className="th-card-reset-margin"
        open={ActiveModalChiTiet}
        width={width >= 1600 ? `85%` : "100%"}
        closable={true}
        onCancel={() => {
          setActiveModalChiTiet(false);
          setDataChiTiet(null);
          setListDataChiTiet([]);
        }}
        footer={null}
      >
        <Card className="th-card-margin-bottom th-card-reset-margin">
          <Row gutter={[0, 10]}>
            <Col
              xxl={8}
              xl={12}
              lg={12}
              md={24}
              sm={24}
              xs={24}
              style={{
                display: "flex",
                alignItems: "flex-start",
              }}
            >
              <span
                style={{
                  width: "145px",
                  fontWeight: "bold",
                }}
              >
                Chuyên đề đào tạo:
              </span>
              {DataChiTiet && (
                <span
                  style={{
                    width: "calc(100% - 145px)",
                  }}
                >
                  {DataChiTiet.tenChuyenDeDaoTao}
                </span>
              )}
            </Col>
            <Col
              xxl={8}
              xl={12}
              lg={12}
              md={24}
              sm={24}
              xs={24}
              style={{
                display: "flex",
                alignItems: "flex-start",
              }}
            >
              <span
                style={{
                  width: "140px",
                  fontWeight: "bold",
                }}
              >
                Hình thức đào tạo:
              </span>
              {DataChiTiet && (
                <span
                  style={{
                    width: "calc(100% - 140px)",
                  }}
                >
                  {DataChiTiet.tenHinhThucDaoTao}
                </span>
              )}
            </Col>
            <Col
              xxl={8}
              xl={12}
              lg={12}
              md={24}
              sm={24}
              xs={24}
              style={{
                display: "flex",
                alignItems: "flex-start",
              }}
            >
              <span
                style={{
                  width: "135px",
                  fontWeight: "bold",
                }}
              >
                Địa điểm đào tạo:
              </span>
              {DataChiTiet && (
                <span
                  style={{
                    width: "calc(100% - 135px)",
                  }}
                >
                  {DataChiTiet.diaDiem}
                </span>
              )}
            </Col>
            <Col
              xxl={8}
              xl={12}
              lg={12}
              md={24}
              sm={24}
              xs={24}
              style={{
                display: "flex",
                alignItems: "flex-start",
              }}
            >
              <span
                style={{
                  width: "90px",
                  fontWeight: "bold",
                }}
              >
                Giảng viên:
              </span>
              {DataChiTiet && (
                <span
                  style={{
                    width: "calc(100% - 90px)",
                  }}
                >
                  {DataChiTiet.tenGiangVien}
                </span>
              )}
            </Col>
            <Col
              xxl={8}
              xl={12}
              lg={12}
              md={24}
              sm={24}
              xs={24}
              style={{
                display: "flex",
                alignItems: "flex-start",
              }}
            >
              <span
                style={{
                  width: "105px",
                  fontWeight: "bold",
                }}
              >
                Tổng học phí:
              </span>
              {DataChiTiet && (
                <span
                  style={{
                    width: "calc(100% - 105px)",
                  }}
                >
                  {numeral(DataChiTiet.tongHocPhi).format("0,0 VNĐ")} VNĐ
                </span>
              )}
            </Col>
          </Row>
        </Card>
        <Card
          className="th-card-margin-bottom th-card-reset-margin"
          title={"Danh sách học viên"}
        >
          <Table
            bordered
            scroll={{ x: 1100, y: "35vh" }}
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

export default BaoCaoHocPhiTheoDonVi;
