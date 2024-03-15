import React, { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Button,
  DatePicker,
  Tag,
  Modal as AntModal,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import { includes, isEmpty, map } from "lodash";
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
import {
  DownloadOutlined,
  ExportOutlined,
  SearchOutlined,
} from "@ant-design/icons";

const { RangePicker } = DatePicker;
const { EditableRow, EditableCell } = EditableTableRow;

function BaoCaoChuyenDeDaoTao({ history, permission }) {
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
  const [ListChuyenDeDaoTao, setListChuyenDeDaoTao] = useState([]);
  const [ChuyenDeDaoTao, setChuyenDeDaoTao] = useState(null);
  const [ListLopHoc, setListLopHoc] = useState([]);
  const [LopHoc, setLopHoc] = useState(null);
  const [Keyword, setKeyword] = useState(null);
  const [TuNgay, setTuNgay] = useState(getNgayDauThang());
  const [DenNgay, setDenNgay] = useState(getNgayCuoiThang());

  useEffect(() => {
    if (permission && permission.view) {
      getDataFilter(ChuyenDeDaoTao, TuNgay, DenNgay);
      getListData(ChuyenDeDaoTao, LopHoc, Keyword, TuNgay, DenNgay);
    } else if ((permission && !permission.view) || permission === undefined) {
      history.push("/home");
    }

    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getListData = (
    vptq_lms_ChuyenDeDaoTao_Id,
    vptq_lms_LopHoc_Id,
    keyword,
    tuNgay,
    denNgay
  ) => {
    const param = convertObjectToUrlParams({
      donViHienHanh_Id: INFO.donVi_Id,
      vptq_lms_ChuyenDeDaoTao_Id,
      vptq_lms_LopHoc_Id,
      keyword,
      tuNgay,
      denNgay,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_BaoCao/bao-cao-chuyen-de-dao-tao?${param}`,
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

  const getDataFilter = (vptq_lms_ChuyenDeDaoTao_Id, tuNgay, denNgay) => {
    const param = convertObjectToUrlParams({
      donViHienHanh_Id: INFO.donVi_Id,
      vptq_lms_ChuyenDeDaoTao_Id,
      tuNgay,
      denNgay,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_BaoCao/filter-bao-cao-chuyen-de-dao-tao?${param}`,
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
          const chuyendedaotao =
            data.list_ChuyenDes && JSON.parse(data.list_ChuyenDes);
          const newData = chuyendedaotao.map((data) => {
            return {
              ...data,
              chuyenDe: `${data.tenChuyenDeDaoTao} (${data.tenHinhThucDaoTao})`,
            };
          });
          setListChuyenDeDaoTao(newData);

          const lophoc =
            data.list_LopHocs &&
            JSON.parse(data.list_LopHocs).map((lh) => {
              return {
                ...lh,
                lopHoc: `${lh.tenLopHoc} (${lh.maLopHoc})`,
              };
            });
          setListLopHoc(lophoc);
        } else {
          setListChuyenDeDaoTao([]);
          setListLopHoc([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const dataList = reDataForTable(DataBaoCao);

  const handleChiTiet = (item) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_BaoCao/bao-cao-chuyen-de-dao-tao/${item.vptq_lms_LopHoc_Id}?donViHienHanh_Id=${INFO.donVi_Id}`,
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
          const chitiet =
            res.data.list_ChiTiets && JSON.parse(res.data.list_ChiTiets);
          setDataChiTiet(res.data);
          setListDataChiTiet(chitiet);
        } else {
          setDataChiTiet(null);
          setListDataChiTiet([]);
        }
        setActiveModalChiTiet(true);
      })
      .catch((error) => console.error(error));
  };

  const actionContent = (item) => {
    const detailItem = { onClick: () => handleChiTiet(item) };

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
    },
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      align: "center",
      width: 50,
      fixed: width >= 1600 && "left",
    },
    {
      title: "Mã lớp học",
      dataIndex: "maLopHoc",
      key: "maLopHoc",
      align: "center",
      width: 120,
      fixed: width >= 1600 && "left",
      filters: removeDuplicates(
        map(DataBaoCao, (d) => {
          return {
            text: d.maLopHoc,
            value: d.maLopHoc,
          };
        })
      ),
      onFilter: (value, record) =>
        record.maLopHoc && record.maLopHoc.includes(value),
      filterSearch: true,
    },
    {
      title: "Tên lớp học",
      dataIndex: "tenLopHoc",
      key: "tenLopHoc",
      align: "left",
      width: 180,
      fixed: width >= 1600 && "left",
      filters: removeDuplicates(
        map(DataBaoCao, (d) => {
          return {
            text: d.tenLopHoc,
            value: d.tenLopHoc,
          };
        })
      ),
      onFilter: (value, record) =>
        record.tenLopHoc && record.tenLopHoc.includes(value),
      filterSearch: true,
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
      filters: removeDuplicates(
        map(DataBaoCao, (d) => {
          return {
            text: d.thoiGianDaoTao,
            value: d.thoiGianDaoTao,
          };
        })
      ),
      onFilter: (value, record) =>
        record.thoiGianDaoTao && record.thoiGianDaoTao.includes(value),
      filterSearch: true,
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
      filters: removeDuplicates(
        map(DataBaoCao, (d) => {
          return {
            text: d.thoiGianKetThuc,
            value: d.thoiGianKetThuc,
          };
        })
      ),
      onFilter: (value, record) =>
        record.thoiGianKetThuc && record.thoiGianKetThuc.includes(value),
      filterSearch: true,
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
      filters: removeDuplicates(
        map(DataBaoCao, (d) => {
          return {
            text: d.thoiLuongDaoTao,
            value: d.thoiLuongDaoTao,
          };
        })
      ),
      onFilter: (value, record) =>
        record.thoiLuongDaoTao.toString().includes(value),
      filterSearch: true,
      render: (value) => {
        return value && <span>{value} phút</span>;
      },
    },
    {
      title: (
        <div>
          Số lượng
          <br />
          học viên
        </div>
      ),
      dataIndex: "soLuong",
      key: "soLuong",
      align: "center",
      width: 100,
      filters: removeDuplicates(
        map(DataBaoCao, (d) => {
          return {
            text: d.soLuong,
            value: d.soLuong,
          };
        })
      ),
      onFilter: (value, record) =>
        record.soLuong && record.soLuong.includes(value),
      filterSearch: true,
      render: (value) => {
        return value && <span>{value} học viên</span>;
      },
    },
    {
      title: "Người đăng ký",
      dataIndex: "tenNguoiTao",
      key: "tenNguoiTao",
      align: "left",
      width: 150,
      filters: removeDuplicates(
        map(DataBaoCao, (d) => {
          return {
            text: d.tenNguoiTao,
            value: d.tenNguoiTao,
          };
        })
      ),
      onFilter: (value, record) =>
        record.tenNguoiTao && record.tenNguoiTao.includes(value),
      filterSearch: true,
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
    },
    {
      title: "Địa điểm đào tạo",
      dataIndex: "diaDiem",
      key: "diaDiem",
      align: "left",
      width: 150,
      filters: removeDuplicates(
        map(DataBaoCao, (d) => {
          return {
            text: d.diaDiem,
            value: d.diaDiem,
          };
        })
      ),
      onFilter: (value, record) =>
        record.diaDiem && record.diaDiem.includes(value),
      filterSearch: true,
    },
    {
      title: "Tình trạng",
      dataIndex: "tinhTrang",
      key: "tinhTrang",
      align: "center",
      width: 150,
      filters: removeDuplicates(
        map(DataBaoCao, (d) => {
          return {
            text: d.tinhTrang,
            value: d.tinhTrang,
          };
        })
      ),
      onFilter: (value, record) =>
        record.tinhTrang && record.tinhTrang.includes(value),
      filterSearch: true,
      render: (value) =>
        value && (
          <Tag
            color={value === "Hoàn thành" ? "blue" : "red"}
            style={{
              whiteSpace: "break-spaces",
              fontSize: 13,
            }}
          >
            {value}
          </Tag>
        ),
    },
    {
      title: "Ghi chú",
      dataIndex: "moTa",
      key: "moTa",
      align: "left",
      width: 150,
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
      title: "Chức vụ",
      dataIndex: "tenChucVu",
      key: "tenChucVu",
      align: "left",
      width: 150,
    },
    {
      title: "Phòng ban",
      dataIndex: "tenPhongBan",
      key: "tenPhongBan",
      align: "left",
      width: 180,
    },
    {
      title: "Đơn vị",
      dataIndex: "tenDonVi",
      key: "tenDonVi",
      align: "left",
      width: 250,
    },
    {
      title: "Trạng thái",
      dataIndex: "trangThai",
      key: "trangThai",
      align: "center",
      width: 150,
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
      vptq_lms_ChuyenDeDaoTao_Id: ChuyenDeDaoTao,
      vptq_lms_LopHoc_Id: LopHoc,
      keyword: Keyword,
      tuNgay: TuNgay,
      denNgay: DenNgay,
      list_ChiTiets: DataBaoCao,
    };
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_BaoCao/export-bao-cao-chuyen-de-dao-tao`,
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
        exportExcel("BAO_CAO_CHUYEN_DE_DAO_TAO", res.data.dataexcel);
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
          disabled={DataBaoCao && DataBaoCao.length === 0}
        >
          Xuất Excel
        </Button>
      </>
    );
  };

  const handleXuatExcelChiTiet = () => {
    const DataXuatExcelChiTiet = {
      ...DataChiTiet,
      list_ChiTiets: ListDataChiTiet,
    };
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_BaoCao/export-bao-cao-chuyen-de-dao-tao/${
            DataChiTiet && DataChiTiet.vptq_lms_LopHoc_Id
          }`,
          "POST",
          DataXuatExcelChiTiet,
          "",
          "",
          resolve,
          reject
        )
      );
    }).then((res) => {
      if (res && res.data) {
        exportExcel("BAO_CAO_CHI_TIET_CHUYEN_DE_DAO_TAO", res.data.dataexcel);
      }
    });
  };

  const handleOnSelectChuyenDeDaoTao = (value) => {
    setChuyenDeDaoTao(value);
    setLopHoc(null);
    getDataFilter(value, TuNgay, DenNgay);
    getListData(value, null, Keyword, TuNgay, DenNgay);
  };

  const handleClearChuyenDeDaoTao = () => {
    setChuyenDeDaoTao(null);
    setLopHoc(null);
    getDataFilter(null, TuNgay, DenNgay);
    getListData(null, null, Keyword, TuNgay, DenNgay);
  };

  const handleOnSelectLopHoc = (value) => {
    setLopHoc(value);
    getListData(ChuyenDeDaoTao, value, Keyword, TuNgay, DenNgay);
  };

  const handleClearLopHoc = () => {
    setLopHoc(null);
    getListData(ChuyenDeDaoTao, null, Keyword, TuNgay, DenNgay);
  };

  const onSearchBaoCao = () => {
    getListData(ChuyenDeDaoTao, LopHoc, Keyword, TuNgay, DenNgay);
  };

  const onChangeKeyword = (val) => {
    setKeyword(val.target.value);
    if (isEmpty(val.target.value)) {
      getListData(ChuyenDeDaoTao, LopHoc, val.target.value, TuNgay, DenNgay);
    }
  };

  const handleChangeNgay = (dateString) => {
    setTuNgay(dateString[0]);
    setDenNgay(dateString[1]);
    setChuyenDeDaoTao(null);
    setLopHoc(null);
    getDataFilter(null, dateString[0], dateString[1]);
    getListData(ChuyenDeDaoTao, LopHoc, Keyword, dateString[0], dateString[1]);
  };

  return (
    <div className="gx-main-content">
      <ContainerHeader
        title="Báo cáo chuyên đề đào tạo"
        description="Báo cáo chuyên đề đào tạo"
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
            <span>Chuyên đề đào tạo:</span>
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListChuyenDeDaoTao ? ListChuyenDeDaoTao : []}
              placeholder="Chọn chuyên đề đào tạo"
              optionsvalue={["vptq_lms_ChuyenDeDaoTao_Id", "chuyenDe"]}
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
            sm={20}
            xs={24}
            style={{
              marginBottom: 8,
            }}
          >
            <span>Lớp học:</span>
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListLopHoc ? ListLopHoc : []}
              placeholder="Chọn lớp học"
              optionsvalue={["vptq_lms_LopHoc_Id", "lopHoc"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="name"
              onSelect={handleOnSelectLopHoc}
              allowClear
              onClear={handleClearLopHoc}
              value={LopHoc}
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
          scroll={{ x: 1750, y: "53vh" }}
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
        title={`CHI TIẾT LỚP HỌC ${
          DataChiTiet && DataChiTiet.maLopHoc.toUpperCase()
        }`}
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
              className="title-span"
            >
              <span style={{ whiteSpace: "nowrap", fontWeight: "bold" }}>
                Chuyên đề đào tạo:
              </span>
              {DataChiTiet && <span>{DataChiTiet.tenChuyenDeDaoTao}</span>}
            </Col>
            <Col
              xxl={8}
              xl={12}
              lg={12}
              md={24}
              sm={24}
              xs={24}
              className="title-span"
            >
              <span
                style={{
                  fontWeight: "bold",
                }}
              >
                Lớp học:
              </span>
              {DataChiTiet && (
                <span>
                  {DataChiTiet.tenLopHoc} ({DataChiTiet.maLopHoc})
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
              className="title-span"
            >
              <span
                style={{
                  fontWeight: "bold",
                }}
              >
                Hình thức đào tạo:
              </span>
              {DataChiTiet && <span>{DataChiTiet.tenHinhThucDaoTao}</span>}
            </Col>
            <Col
              xxl={8}
              xl={12}
              lg={12}
              md={24}
              sm={24}
              xs={24}
              className="title-span"
            >
              <span
                style={{
                  fontWeight: "bold",
                }}
              >
                Địa điểm đào tạo:
              </span>
              {DataChiTiet && <span>{DataChiTiet.diaDiem}</span>}
            </Col>
            <Col
              xxl={8}
              xl={12}
              lg={12}
              md={24}
              sm={24}
              xs={24}
              className="title-span"
            >
              <span
                style={{
                  fontWeight: "bold",
                }}
              >
                Giảng viên:
              </span>
              {DataChiTiet && <span>{DataChiTiet.tenGiangVien}</span>}
            </Col>
            <Col
              xxl={8}
              xl={12}
              lg={12}
              md={24}
              sm={24}
              xs={24}
              className="title-span"
            >
              <span
                style={{
                  fontWeight: "bold",
                }}
              >
                Số lượng học viên:
              </span>
              {DataChiTiet && <span>{DataChiTiet.soLuong} học viên</span>}
            </Col>
            <Col
              xxl={8}
              xl={12}
              lg={12}
              md={24}
              sm={24}
              xs={24}
              className="title-span"
            >
              <span
                style={{
                  fontWeight: "bold",
                }}
              >
                Thời lượng đào tạo:
              </span>
              {DataChiTiet && <span>{DataChiTiet.thoiLuongDaoTao} phút</span>}
            </Col>
            <Col
              xxl={8}
              xl={12}
              lg={12}
              md={24}
              sm={24}
              xs={24}
              className="title-span"
            >
              <span
                style={{
                  fontWeight: "bold",
                }}
              >
                Thời gian đào tạo:
              </span>
              {DataChiTiet && <span>{DataChiTiet.thoiGianDaoTao}</span>}
            </Col>
            <Col
              xxl={8}
              xl={12}
              lg={12}
              md={24}
              sm={24}
              xs={24}
              className="title-span"
            >
              <span
                style={{
                  fontWeight: "bold",
                }}
              >
                Thời gian kết thúc:
              </span>
              {DataChiTiet && <span>{DataChiTiet.thoiGianKetThuc}</span>}
            </Col>
          </Row>
          <div align={"end"}>
            <Button
              icon={<ExportOutlined />}
              className="th-margin-bottom-0 btn-margin-bottom-0"
              onClick={() => handleXuatExcelChiTiet()}
              type="primary"
            >
              Xuất excel
            </Button>
          </div>
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

export default BaoCaoChuyenDeDaoTao;
