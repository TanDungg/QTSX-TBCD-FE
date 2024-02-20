import { HistoryOutlined, SearchOutlined } from "@ant-design/icons";
import {
  Card,
  Col,
  Divider,
  Modal as AntModal,
  Row,
  Tag,
  Button,
  Radio,
  Image,
} from "antd";
import isEmpty from "lodash/isEmpty";
import map from "lodash/map";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { removeDuplicates, reDataForTable } from "src/util/Common";
import { fetchReset, fetchStart } from "src/appRedux/actions/Common";
import {
  EditableTableRow,
  Select,
  Table,
  Toolbar,
} from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";
import { convertObjectToUrlParams } from "src/util/Common";
import { BASE_URL_API } from "src/constants/Config";
import ReactPlayer from "react-player";
import ModalThiKhaoSat from "./ModalThiKhaoSat";

const { EditableRow, EditableCell } = EditableTableRow;

function ThiKhaoSat({ permission, history }) {
  const dispatch = useDispatch();
  const { loading, width } = useSelector(({ common }) => common).toJS();
  const [Data, setData] = useState([]);
  const [IsAdmin, setIsAdmin] = useState(null);
  const [ListKienThuc, setListKienThuc] = useState([]);
  const [KienThuc, setKienThuc] = useState(null);
  const [ListChuyenDeDaoTao, setListChuyenDeDaoTao] = useState([]);
  const [ChuyenDeDaoTao, setChuyenDeDaoTao] = useState(null);
  const [ListLopHoc, setListLopHoc] = useState([]);
  const [LopHoc, setLopHoc] = useState(null);
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [ThongTinLichSu, setThongTinLichSu] = useState(null);
  const [DataLichSu, setDataLichSu] = useState([]);
  const [ActiveModalLichSu, setActiveModalLichSu] = useState(false);
  const [DataChiTiet, setDataChiTiet] = useState(null);
  const [ChiTiet, setChiTiet] = useState([]);
  const [ActiveModalChiTiet, setActiveModalChiTiet] = useState(false);
  const [ThongTinThi, setThongTinThi] = useState(null);
  const [ActiveModalThiKhaoSat, setActiveModalThiKhaoSat] = useState(false);

  useEffect(() => {
    if (permission && permission.view) {
      getIsAdmin();
      getListFilter();
      getListData(KienThuc, ChuyenDeDaoTao, LopHoc, keyword, page);
    } else if ((permission && !permission.view) || permission === undefined) {
      history.push("/home");
    }
    return () => dispatch(fetchReset());

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getListData = (
    vptq_lms_KienThuc_Id,
    vptq_lms_ChuyenDeDaoTao_Id,
    vptq_lms_LopHoc_Id,
    keyword,
    page
  ) => {
    let param = convertObjectToUrlParams({
      vptq_lms_KienThuc_Id,
      vptq_lms_ChuyenDeDaoTao_Id,
      vptq_lms_LopHoc_Id,
      keyword,
      page,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_ThiTrucTuyen/thi-truc-tuyen?${param}`,
          "GET",
          null,
          "DETAIL",
          "",
          resolve,
          reject
        )
      );
    }).then((res) => {
      if (res && res.data) {
        setData(res.data);
      } else {
        setData([]);
      }
    });
  };

  const getIsAdmin = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_BaoCao/is-admin`,
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
          setIsAdmin(res.data);
        } else {
          setIsAdmin(null);
        }
      })
      .catch((error) => console.error(error));
  };

  const getListFilter = (vptq_lms_KienThuc_Id, vptq_lms_ChuyenDeDaoTao_Id) => {
    const param = convertObjectToUrlParams({
      vptq_lms_KienThuc_Id,
      vptq_lms_ChuyenDeDaoTao_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_ThiTrucTuyen/filter-thi-truc-tuyen?${param}`,
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
          setListKienThuc(res.data.list_KienThucs);
          setListChuyenDeDaoTao(res.data.list_ChuyenDeDaoTaos);
          setListLopHoc(res.data.list_LopHocs);
        } else {
          setListKienThuc([]);
          setListChuyenDeDaoTao([]);
          setListLopHoc([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const handleTableChange = (pagination) => {
    setPage(pagination);
    getListData(KienThuc, ChuyenDeDaoTao, LopHoc, keyword, pagination);
  };

  const onSearchThiKhaoSat = () => {
    getListData(KienThuc, ChuyenDeDaoTao, LopHoc, keyword, page);
  };

  const onChangeKeyword = (val) => {
    setKeyword(val.target.value);
    if (isEmpty(val.target.value)) {
      getListData(KienThuc, ChuyenDeDaoTao, LopHoc, val.target.value, page);
    }
  };

  const handleKichHoatThiLai = (vptq_lms_LopHocChiTiet_Id) => {
    const param = convertObjectToUrlParams({
      vptq_lms_LopHocChiTiet_Id: vptq_lms_LopHocChiTiet_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_ThiTrucTuyen/kich-hoat-thi-lai?${param}`,
          "POST",
          null,
          "KICHHOAT",
          "",
          resolve,
          reject
        )
      );
    }).then((res) => {
      if (res && res.status !== 409) {
        getListData(KienThuc, ChuyenDeDaoTao, LopHoc, keyword, page);
      }
    });
  };

  const ButtonThi = (item) => {
    return (
      <div>
        {item.isBatDauThi === 1 ? (
          <Button
            className="th-margin-bottom-0"
            type="primary"
            onClick={() => {
              setActiveModalThiKhaoSat(true);
              setThongTinThi(item);
            }}
          >
            Thi khảo sát
          </Button>
        ) : item.isDangThi === 1 ? (
          <Button
            className="th-margin-bottom-0"
            type="danger"
            onClick={() => {
              setActiveModalThiKhaoSat(true);
              setThongTinThi(item);
            }}
          >
            Tiếp tục thi
          </Button>
        ) : item.isKichHoatThiLai === 1 ? (
          <Button
            className="th-margin-bottom-0"
            type="primary"
            onClick={() => handleKichHoatThiLai(item.vptq_lms_LopHocChiTiet_Id)}
            disabled={item.isKichHoatThiLai === 0}
          >
            Thi lại
          </Button>
        ) : null}
      </div>
    );
  };

  const handleXemLichSu = (item) => {
    setThongTinLichSu(item);
    const chitiet = item.list_ChiTiets && JSON.parse(item.list_ChiTiets);
    setDataLichSu(chitiet);
    setActiveModalLichSu(true);
  };

  const handleXemChiTiet = (item) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_ThiTrucTuyen/${item.vptq_lms_ThiTrucTuyen_Id}`,
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
          setDataChiTiet(res.data);
          const chitiet =
            res.data.list_ChiTiets &&
            JSON.parse(res.data.list_ChiTiets).map((ct) => {
              return {
                ...ct,
                list_DapAns: ct.list_DapAns.map((ans) => {
                  return {
                    ...ans,
                    vptq_lms_ThiTrucTuyenChiTietDapAn_Id:
                      ans.vptq_lms_ThiTrucTuyenChiTietDapAn_Id.toLowerCase(),
                    isChon: ans.isChon === 1 ? true : false,
                  };
                }),
              };
            });
          setChiTiet(chitiet);
        } else {
          setDataChiTiet(null);
          setChiTiet([]);
        }
      })
      .catch((error) => console.error(error));
    setActiveModalChiTiet(true);
  };

  const actionContent = (item) => {
    const lichsu =
      item.hasThiLai === 1
        ? { onClick: () => handleXemLichSu(item) }
        : { disabled: true };

    const chitiet =
      item.isXemChiTiet === 1
        ? { onClick: () => handleXemChiTiet(item) }
        : { disabled: true };

    return (
      <div>
        <React.Fragment>
          <a {...chitiet} title="Xem chi tiết bài thi khảo sát">
            <SearchOutlined />
          </a>
          <Divider type="vertical" />
          <a {...lichsu} title="Xem lịch sử thi khảo sát">
            <HistoryOutlined />
          </a>
        </React.Fragment>
      </div>
    );
  };

  const { totalRow } = Data;
  let dataList = reDataForTable(Data.datalist);

  let colValues = [
    {
      title: "Chức năng",
      key: "action",
      align: "center",
      width: 100,
      render: (value) => actionContent(value),
      fixed: "left",
    },
    {
      title: "Chuyên đề",
      dataIndex: "tenChuyenDeDaoTao",
      key: "tenChuyenDeDaoTao",
      align: "left",
      width: 200,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenChuyenDeDaoTao,
            value: d.tenChuyenDeDaoTao,
          };
        })
      ),
      onFilter: (value, record) => record.tenChuyenDeDaoTao.includes(value),
      filterSearch: true,
    },
    {
      title: "Tên đề thi",
      dataIndex: "tenDeThi",
      key: "tenDeThi",
      align: "left",
      width: 200,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenDeThi,
            value: d.tenDeThi,
          };
        })
      ),
      onFilter: (value, record) => record.tenDeThi.includes(value),
      filterSearch: true,
    },
    {
      title: "Người thi",
      dataIndex: "fullName",
      key: "fullName",
      align: "left",
      width: 150,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.fullName,
            value: d.fullName,
          };
        })
      ),
      onFilter: (value, record) => record.fullName.includes(value),
      filterSearch: true,
    },
    {
      title: "Thời gian thi",
      dataIndex: "thoiGianBatDauThi",
      key: "thoiGianBatDauThi",
      align: "center",
      width: 150,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.thoiGianBatDauThi,
            value: d.thoiGianBatDauThi,
          };
        })
      ),
      onFilter: (value, record) => record.thoiGianBatDauThi.includes(value),
      filterSearch: true,
    },
    {
      title: "Số điểm",
      dataIndex: "soDiem",
      key: "soDiem",
      align: "center",
      width: 100,
      render: (value) => {
        return value && <span>{value} điểm</span>;
      },
    },
    {
      title: "Hoàn thành",
      dataIndex: "phanTram",
      key: "phanTram",
      align: "center",
      width: 100,
      render: (value) => {
        return <span>{value} %</span>;
      },
    },
    {
      title: "Đánh giá",
      dataIndex: "ketQua",
      key: "ketQua",
      align: "center",
      width: 100,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.ketQua,
            value: d.ketQua,
          };
        })
      ),
      onFilter: (value, record) => record.ketQua.includes(value),
      filterSearch: true,
      render: (value) => {
        return (
          value && (
            <span
              style={{
                fontWeight: "bold",
                color: value === "Đạt" ? "#0469b9" : "red",
              }}
            >
              {value}
            </span>
          )
        );
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "trangThai",
      key: "trangThai",
      align: "center",
      width: 150,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.trangThai,
            value: d.trangThai,
          };
        })
      ),
      onFilter: (value, record) => record.trangThai.includes(value),
      filterSearch: true,
      render: (value, record) =>
        value && (
          <Tag
            color={
              value === "Chưa thi" || value === "Đang thi"
                ? "orange"
                : value === "Hoàn thành"
                ? "blue"
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

  if (IsAdmin) {
    colValues.unshift({
      key: "action",
      align: "center",
      width: 120,
      render: (record) => ButtonThi(record),
      fixed: "left",
    });
  }

  let colLichSu = [
    {
      title: "Lần thi",
      dataIndex: "lanThiThu",
      key: "lanThiThu",
      align: "center",
      width: 150,
      render: (value) => {
        return value && <span>Lần thứ {value}</span>;
      },
    },
    {
      title: "Thời gian thi",
      dataIndex: "thoiGianBatDauThi",
      key: "thoiGianBatDauThi",
      align: "center",
      width: 150,
    },
    {
      title: "Thời gian kết thúc",
      dataIndex: "thoiGianKetThucThi",
      key: "thoiGianKetThucThi",
      align: "center",
      width: 150,
    },
    {
      title: "Số điểm",
      dataIndex: "soDiem",
      key: "soDiem",
      align: "center",
      width: 100,
      render: (value) => {
        return value && <span>{value} điểm</span>;
      },
    },
    {
      title: "Hoàn thành",
      dataIndex: "phanTram",
      key: "phanTram",
      align: "center",
      width: 100,
      render: (value) => {
        return <span>{value} %</span>;
      },
    },
    {
      title: "Đánh giá",
      dataIndex: "ketQua",
      key: "ketQua",
      align: "center",
      width: 100,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.ketQua,
            value: d.ketQua,
          };
        })
      ),
      onFilter: (value, record) => record.ketQua.includes(value),
      filterSearch: true,
      render: (value) => {
        return (
          value && (
            <span
              style={{
                fontWeight: "bold",
                color: value === "Đạt" ? "#0469b9" : "red",
              }}
            >
              {value}
            </span>
          )
        );
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "trangThai",
      key: "trangThai",
      align: "center",
      width: 150,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.trangThai,
            value: d.trangThai,
          };
        })
      ),
      onFilter: (value, record) => record.trangThai.includes(value),
      filterSearch: true,
      render: (value, record) =>
        value && (
          <Tag
            color={
              value === "Chưa thi"
                ? "orange"
                : value === "Hoàn thành"
                ? "blue"
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

  const handleOnSelectKienThuc = (value) => {
    setKienThuc(value);
    setChuyenDeDaoTao(null);
    setLopHoc(null);
    getListFilter(value);
    getListData(value, null, null, keyword, page);
  };

  const handleClearKienThuc = () => {
    setKienThuc(null);
    setChuyenDeDaoTao(null);
    setLopHoc(null);
    getListFilter();
    getListData(null, null, null, keyword, page);
  };

  const handleOnSelectChuyenDeDaoTao = (value) => {
    setChuyenDeDaoTao(value);
    setLopHoc(null);
    getListFilter(KienThuc, value);
    getListData(KienThuc, value, null, keyword, page);
  };

  const handleClearChuyenDeDaoTao = () => {
    setChuyenDeDaoTao(null);
    setLopHoc(null);
    getListFilter();
    getListData(KienThuc, null, null, keyword, page);
  };

  const handleOnSelectLopHoc = (value) => {
    setLopHoc(value);
    getListData(KienThuc, ChuyenDeDaoTao, value, keyword, page);
  };

  const handleClearLopHoc = () => {
    setLopHoc(null);
    getListData(KienThuc, ChuyenDeDaoTao, null, keyword, page);
  };

  const getDefaultDapAn = (list_DapAns) => {
    const dapan = list_DapAns.find((ans) => ans.isChon);
    return dapan ? dapan.vptq_lms_ThiTrucTuyenChiTietDapAn_Id : undefined;
  };

  const handleRefesh = () => {
    getListData(KienThuc, ChuyenDeDaoTao, LopHoc, keyword, page);
  };

  return (
    <div className="gx-main-content">
      <ContainerHeader
        title={"Thi khảo sát"}
        description="Danh sách thi khảo sát"
      />
      <Card className="th-card-margin-bottom">
        <Row>
          <Col
            xxl={6}
            xl={8}
            lg={12}
            md={12}
            sm={24}
            xs={24}
            style={{ marginBottom: 8 }}
          >
            <span>Kiến thức:</span>
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListKienThuc ? ListKienThuc : []}
              placeholder="Chọn kiến thức"
              optionsvalue={["vptq_lms_KienThuc_Id", "tenKienThuc"]}
              style={{ width: "100%" }}
              value={KienThuc}
              showSearch
              optionFilterProp={"name"}
              onSelect={handleOnSelectKienThuc}
              allowClear
              onClear={handleClearKienThuc}
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
            <span>Chuyên đề đào tạo:</span>
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListChuyenDeDaoTao ? ListChuyenDeDaoTao : []}
              placeholder="Chọn chuyên đề đào tạo"
              optionsvalue={["vptq_lms_ChuyenDeDaoTao_Id", "tenChuyenDeDaoTao"]}
              style={{ width: "100%" }}
              value={ChuyenDeDaoTao}
              showSearch
              optionFilterProp={"name"}
              onSelect={handleOnSelectChuyenDeDaoTao}
              allowClear
              onClear={handleClearChuyenDeDaoTao}
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
            <span>Lớp học:</span>
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListLopHoc ? ListLopHoc : []}
              placeholder="Chọn lớp học"
              optionsvalue={["vptq_lms_LopHoc_Id", "tenLopHoc"]}
              style={{ width: "100%" }}
              value={LopHoc}
              showSearch
              optionFilterProp={"name"}
              onSelect={handleOnSelectLopHoc}
              allowClear
              onClear={handleClearLopHoc}
            />
          </Col>
          {IsAdmin && (
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
                  value: keyword,
                  onChange: onChangeKeyword,
                  onPressEnter: onSearchThiKhaoSat,
                  onSearch: onSearchThiKhaoSat,
                  placeholder: "Nhập từ khóa",
                  allowClear: true,
                }}
              />
            </Col>
          )}
        </Row>
      </Card>
      <Card className="th-card-margin-bottom th-card-reset-margin">
        <Table
          bordered
          columns={columns}
          scroll={{ x: 1300, y: "49vh" }}
          components={components}
          className="gx-table-responsive th-table"
          dataSource={dataList}
          size="small"
          rowClassName={"editable-row"}
          pagination={{
            onChange: handleTableChange,
            pageSize: 20,
            total: totalRow,
            showSizeChanger: false,
            showQuickJumper: true,
          }}
          loading={loading}
        />
      </Card>
      <AntModal
        title={"Chi tiết bài thi khảo sát"}
        className="th-card-reset-margin"
        open={ActiveModalChiTiet}
        width={width >= 1600 ? `70%` : width >= 1200 ? `85%` : "100%"}
        closable={true}
        onCancel={() => setActiveModalChiTiet(false)}
        footer={null}
      >
        <Card className="th-card-margin-bottom th-card-reset-margin">
          <Row gutter={[0, 10]}>
            <Col
              xxl={8}
              xl={8}
              lg={12}
              md={12}
              sm={24}
              xs={24}
              style={{
                display: "flex",
                alignItems: "flex-start",
              }}
            >
              <span
                style={{
                  width: "70px",
                  fontWeight: "bold",
                }}
              >
                Lần thi:
              </span>
              {DataChiTiet && (
                <span
                  style={{
                    width: "calc(100% - 70px)",
                  }}
                >
                  Lần thứ {DataChiTiet.lanThiThu}
                </span>
              )}
            </Col>
            <Col
              xxl={8}
              xl={8}
              lg={12}
              md={12}
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
                Thời gian bắt đầu:
              </span>
              {DataChiTiet && (
                <span
                  style={{
                    width: "calc(100% - 140px)",
                  }}
                >
                  {DataChiTiet.thoiGianBatDauThi}
                </span>
              )}
            </Col>
            <Col
              xxl={8}
              xl={8}
              lg={12}
              md={12}
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
                Thời gian kết thúc:
              </span>
              {DataChiTiet && (
                <span
                  style={{
                    width: "calc(100% - 145px)",
                  }}
                >
                  {DataChiTiet.thoiGianKetThucThi}
                </span>
              )}
            </Col>
            <Col
              xxl={8}
              xl={8}
              lg={12}
              md={12}
              sm={24}
              xs={24}
              style={{
                display: "flex",
                alignItems: "flex-start",
              }}
            >
              <span
                style={{
                  width: "100px",
                  fontWeight: "bold",
                }}
              >
                Số câu đúng:
              </span>
              {DataChiTiet && (
                <span
                  style={{
                    width: "calc(100% - 100px)",
                  }}
                >
                  {DataChiTiet.soCauTraLoiDung} câu
                </span>
              )}
            </Col>
            <Col
              xxl={8}
              xl={8}
              lg={12}
              md={12}
              sm={24}
              xs={24}
              style={{
                display: "flex",
                alignItems: "flex-start",
              }}
            >
              <span
                style={{
                  width: "80px",
                  fontWeight: "bold",
                }}
              >
                Số điểm:
              </span>
              {DataChiTiet && (
                <span
                  style={{
                    width: "calc(100% - 80px)",
                  }}
                >
                  {DataChiTiet.soDiem} điểm
                </span>
              )}
            </Col>
            <Col
              xxl={8}
              xl={8}
              lg={12}
              md={12}
              sm={24}
              xs={24}
              style={{
                display: "flex",
                alignItems: "flex-start",
              }}
            >
              <span
                style={{
                  width: "80px",
                  fontWeight: "bold",
                }}
              >
                Kết quả:
              </span>
              {DataChiTiet && (
                <span
                  style={{
                    width: "calc(100% - 80px)",
                    color:
                      DataChiTiet.ketQua === "Không đạt" ? "red" : "#0469b9",
                    fontWeight: "bold",
                  }}
                >
                  {DataChiTiet.ketQua}
                </span>
              )}
            </Col>
          </Row>
        </Card>
        <Card
          className="th-card-margin-bottom th-card-reset-margin"
          title={"Danh sách câu hỏi"}
          style={{
            maxHeight: "50vh",
            overflowY: "auto",
            width: "100%",
          }}
        >
          <Row gutter={[0, 10]}>
            {ChiTiet
              ? ChiTiet.map((ketqua, index) => {
                  return (
                    <Col span={24}>
                      <Row gutter={[0, 10]}>
                        <Col span={24}>
                          <span
                            style={{
                              fontWeight: "bold",
                            }}
                          >
                            Câu {index + 1}. ({DataChiTiet.soDiemMoiCau} điểm):{" "}
                            {ketqua.noiDung}
                          </span>
                        </Col>
                        {ketqua.hinhAnh || ketqua.video ? (
                          <Col
                            span={24}
                            style={{
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                          >
                            {ketqua.hinhAnh && (
                              <div
                                style={{
                                  flex: "1",
                                  textAlign: "center",
                                  padding: "0 10px",
                                }}
                              >
                                <Image
                                  src={BASE_URL_API + ketqua.hinhAnh}
                                  alt="Hình ảnh"
                                  style={{ height: "150px" }}
                                />
                              </div>
                            )}
                            {ketqua.video && (
                              <div
                                style={{
                                  flex: "1",
                                  textAlign: "center",
                                  padding: "0 10px",
                                }}
                              >
                                {ketqua.video.endsWith(".mp4") ? (
                                  <ReactPlayer
                                    style={{ cursor: "pointer" }}
                                    url={BASE_URL_API + ketqua.video}
                                    width="240px"
                                    height="150px"
                                    playing={true}
                                    muted={true}
                                    controls={false}
                                    onClick={() => {
                                      window.open(
                                        BASE_URL_API + ketqua.video,
                                        "_blank"
                                      );
                                    }}
                                  />
                                ) : (
                                  <a
                                    target="_blank"
                                    href={BASE_URL_API + ketqua.video}
                                    rel="noopener noreferrer"
                                  >
                                    {ketqua.video.split("/")[5]}
                                  </a>
                                )}
                              </div>
                            )}
                          </Col>
                        ) : null}
                        <Col span={24}>
                          <Radio.Group
                            value={getDefaultDapAn(ketqua.list_DapAns)}
                          >
                            <Row gutter={[0, 5]}>
                              {ketqua.list_DapAns &&
                                ketqua.list_DapAns.map((ans, index) => {
                                  return (
                                    <Col span={24}>
                                      <Radio
                                        value={
                                          ans.vptq_lms_ThiTrucTuyenChiTietDapAn_Id
                                        }
                                        disabled
                                        style={{
                                          display: "flex",
                                          alignItems: "flex-start",
                                        }}
                                      >
                                        <span
                                          style={{
                                            fontWeight: "bold",
                                            color:
                                              ans.isChon && ketqua.isCorrect
                                                ? "#0469b9"
                                                : ans.isChon &&
                                                  !ketqua.isCorrect
                                                ? "red"
                                                : "",
                                          }}
                                        >
                                          {String.fromCharCode(65 + index)}.
                                        </span>
                                        {"  "}
                                        <span
                                          style={{
                                            whiteSpace: "break-spaces",
                                            fontWeight: ans.isChon && "bold",
                                            color:
                                              ans.isChon && ketqua.isCorrect
                                                ? "#0469b9"
                                                : ans.isChon &&
                                                  !ketqua.isCorrect
                                                ? "red"
                                                : "",
                                          }}
                                        >
                                          {ans.dapAn}
                                        </span>
                                      </Radio>
                                    </Col>
                                  );
                                })}
                            </Row>
                          </Radio.Group>
                        </Col>
                      </Row>
                    </Col>
                  );
                })
              : null}
          </Row>
        </Card>
      </AntModal>
      <AntModal
        title={"Thông tin lịch sử thi khảo sát"}
        className="th-card-reset-margin"
        open={ActiveModalLichSu}
        width={width >= 1600 ? `70%` : width >= 1200 ? `85%` : "100%"}
        closable={true}
        onCancel={() => setActiveModalLichSu(false)}
        footer={null}
      >
        <Card className="th-card-margin-bottom th-card-reset-margin">
          <Row gutter={[0, 10]}>
            <Col
              xxl={8}
              xl={8}
              lg={12}
              md={12}
              sm={24}
              xs={24}
              style={{
                display: "flex",
                alignItems: "flex-start",
              }}
            >
              <span
                style={{
                  width: "120px",
                  fontWeight: "bold",
                }}
              >
                Tên chuyên đề:
              </span>
              {ThongTinLichSu && (
                <span
                  style={{
                    width: "calc(100% - 120px)",
                  }}
                >
                  {ThongTinLichSu.tenChuyenDeDaoTao}
                </span>
              )}
            </Col>
            <Col
              xxl={8}
              xl={8}
              lg={12}
              md={12}
              sm={24}
              xs={24}
              style={{
                display: "flex",
                alignItems: "flex-start",
              }}
            >
              <span
                style={{
                  width: "100px",
                  fontWeight: "bold",
                }}
              >
                Tên đề thi:
              </span>
              {ThongTinLichSu && (
                <span
                  style={{
                    width: "calc(100% - 100px)",
                  }}
                >
                  {ThongTinLichSu.tenDeThi}
                </span>
              )}
            </Col>
            <Col
              xxl={8}
              xl={8}
              lg={12}
              md={12}
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
                Người thi:
              </span>
              {ThongTinLichSu && (
                <span
                  style={{
                    width: "calc(100% - 90px)",
                  }}
                >
                  {ThongTinLichSu.fullName}
                </span>
              )}
            </Col>
          </Row>
        </Card>
        <Card
          className="th-card-margin-bottom th-card-reset-margin"
          title={"Lịch sử thi khảo sát"}
        >
          <Table
            bordered
            columns={colLichSu}
            components={components}
            scroll={{ x: 900, y: "40vh" }}
            className="gx-table-responsive th-table"
            dataSource={reDataForTable(DataLichSu)}
            size="small"
            loading={loading}
            pagination={false}
          />
        </Card>
      </AntModal>
      <ModalThiKhaoSat
        openModal={ActiveModalThiKhaoSat}
        openModalFS={setActiveModalThiKhaoSat}
        thongtin={ThongTinThi && ThongTinThi.vptq_lms_ThiTrucTuyen_Id}
        isDangThi={ThongTinThi && ThongTinThi.isDangThi}
        refesh={handleRefesh}
      />
    </div>
  );
}

export default ThiKhaoSat;
