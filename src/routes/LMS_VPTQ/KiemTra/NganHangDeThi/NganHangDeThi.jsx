import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Divider,
  Modal as AntModal,
  Row,
  Checkbox,
  Tag,
  Image,
} from "antd";
import isEmpty from "lodash/isEmpty";
import map from "lodash/map";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { removeDuplicates, reDataForTable } from "src/util/Common";
import { fetchReset, fetchStart } from "src/appRedux/actions/Common";
import {
  EditableTableRow,
  ModalDeleteConfirm,
  Select,
  Table,
  Toolbar,
} from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";
import { convertObjectToUrlParams } from "src/util/Common";
import ModalThiThu from "./ModalThiThu";
import { BASE_URL_API } from "src/constants/Config";
import ReactPlayer from "react-player";

const { EditableRow, EditableCell } = EditableTableRow;

function NganHangDeThi({ permission, history, match }) {
  const dispatch = useDispatch();
  const { loading, width } = useSelector(({ common }) => common).toJS();
  const [Data, setData] = useState([]);
  const [ListKienThuc, setListKienThuc] = useState([]);
  const [KienThuc, setKienThuc] = useState(null);
  const [ListChuyenDeDaoTao, setListChuyenDeDaoTao] = useState([]);
  const [ChuyenDeDaoTao, setChuyenDeDaoTao] = useState(null);
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [DataChiTiet, setDataChiTiet] = useState(null);
  const [ListCauHoi, setListCauHoi] = useState([]);
  const [id, setId] = useState(null);
  const [ActiveModalChiTietDeThi, setActiveModalChiTietDeThi] = useState(false);
  const [ActiveModalThiThu, setActiveModalThiThu] = useState(false);
  const [LichSuThiThu, setLichSuThiThu] = useState([]);
  const [ActiveModalLichSuThiThu, setActiveModalLichSuThiThu] = useState(false);

  useEffect(() => {
    if (permission && permission.view) {
      getListKienThuc();
      getListChuyenDeDaoTao();
      getListData(KienThuc, ChuyenDeDaoTao, keyword, page);
    } else if ((permission && !permission.view) || permission === undefined) {
      history.push("/home");
    }
    return () => dispatch(fetchReset());

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getListData = (
    vptq_lms_KienThuc_Id,
    vptq_lms_ChuyenDeDaoTao_Id,
    keyword,
    page
  ) => {
    let param = convertObjectToUrlParams({
      vptq_lms_KienThuc_Id,
      vptq_lms_ChuyenDeDaoTao_Id,
      keyword,
      page,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_DeThi?${param}`,
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
        const newData = {
          ...res.data,
          datalist:
            res.data.datalist &&
            res.data.datalist.map((dt) => {
              return {
                ...dt,
                soLuongCauHoi: `${dt.soLuongCauHoi} câu`,
                thangDiem: `${dt.thangDiem} điểm`,
                thoiGianLamBai: `${dt.thoiGianLamBai} phút`,
              };
            }),
        };
        setData(newData);
      } else {
        setData([]);
      }
    });
  };

  const getListKienThuc = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_KienThuc?page=-1`,
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
          setListKienThuc(res.data);
        } else {
          setListKienThuc([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getListChuyenDeDaoTao = (vptq_lms_KienThuc_Id) => {
    const param = convertObjectToUrlParams({ vptq_lms_KienThuc_Id, page: -1 });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_ChuyenDeDaoTao?${param}`,
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
          setListChuyenDeDaoTao(res.data);
        } else {
          setListChuyenDeDaoTao([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const handleTableChange = (pagination) => {
    setPage(pagination);
    getListData(KienThuc, ChuyenDeDaoTao, keyword, pagination);
  };

  const onSearchDeThi = () => {
    getListData(KienThuc, ChuyenDeDaoTao, keyword, page);
  };

  const onChangeKeyword = (val) => {
    setKeyword(val.target.value);
    if (isEmpty(val.target.value)) {
      getListData(KienThuc, ChuyenDeDaoTao, val.target.value, page);
    }
  };

  const handleChiTiet = (item) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_DeThi/${item.id}`,
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
        setId(item);
        setDataChiTiet(res.data);
        setListCauHoi(res.data.list_ChiTiets);
      } else {
        setDataChiTiet(null);
        setListCauHoi([]);
      }
    });
    setActiveModalChiTietDeThi(true);
  };

  const deleteItemFunc = (item) => {
    const title = "đề thi";
    ModalDeleteConfirm(deleteItemAction, item, item.maDeThi, title);
  };

  const deleteItemAction = (item) => {
    let url = `vptq_lms_DeThi/${item.id}`;
    new Promise((resolve, reject) => {
      dispatch(fetchStart(url, "DELETE", null, "DELETE", "", resolve, reject));
    })
      .then((res) => {
        getListData(KienThuc, ChuyenDeDaoTao, keyword, page);
      })
      .catch((error) => console.error(error));
  };

  const actionContent = (item) => {
    const detailItem =
      permission && permission.del && !item.isUsed
        ? { onClick: () => handleChiTiet(item) }
        : { disabled: true };

    const editItem =
      permission && permission.edit ? (
        <Link
          to={{
            pathname: `${match.url}/${item.id}/chinh-sua`,
            state: { itemData: item, permission },
          }}
          title="Chỉnh sửa đề thi"
        >
          <EditOutlined />
        </Link>
      ) : (
        <span disabled title="Chỉnh sửa đề thi">
          <EditOutlined />
        </span>
      );

    const deleteItemVal =
      permission && permission.del && !item.isUsed
        ? { onClick: () => deleteItemFunc(item) }
        : { disabled: true };
    return (
      <div>
        <React.Fragment>
          <a {...detailItem} title="Xem chi tiết đề thi">
            <SearchOutlined />
          </a>
          <Divider type="vertical" />
          {editItem}
          <Divider type="vertical" />
          <a {...deleteItemVal} title="Xóa đề thi">
            <DeleteOutlined />
          </a>
        </React.Fragment>
      </div>
    );
  };

  const { totalRow } = Data;
  let dataList = reDataForTable(Data.datalist);

  const handleChangeSuDung = (record) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_DeThi/set-su-dung/${record.id}`,
          "PUT",
          null,
          "EDIT",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res.status !== 409) {
          getListData(KienThuc, ChuyenDeDaoTao, keyword, page);
        }
      })
      .catch((error) => console.error(error));
  };

  const handleChangeMacDinh = (record) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_DeThi/set-default/${record.id}`,
          "PUT",
          null,
          "EDIT",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res.status !== 409) {
          getListData(KienThuc, ChuyenDeDaoTao, keyword, page);
        }
      })
      .catch((error) => console.error(error));
  };

  let colValues = [
    {
      title: "Chức năng",
      key: "action",
      align: "center",
      width: 100,
      render: (value) => actionContent(value),
      fixed: width >= 1600 && "left",
    },
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      width: 50,
      align: "center",
      fixed: width >= 1600 && "left",
    },
    {
      title: (
        <div>
          Trạng thái <br />
          sử dụng
        </div>
      ),
      dataIndex: "isSuDung",
      key: "isSuDung",
      align: "center",
      width: 80,
      fixed: width >= 1600 && "left",
      render: (value, record) => {
        return (
          <Checkbox
            checked={value}
            onChange={() => handleChangeSuDung(record)}
          />
        );
      },
    },
    {
      title: "Mặc định",
      dataIndex: "isDefault",
      key: "isDefault",
      align: "center",
      width: 80,
      fixed: width >= 1600 && "left",
      render: (value, record) => {
        return (
          <Checkbox
            checked={value}
            onChange={() => handleChangeMacDinh(record)}
          />
        );
      },
    },
    {
      title: "Mã đề thi",
      dataIndex: "maDeThi",
      key: "maDeThi",
      align: "center",
      width: 130,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.maDeThi,
            value: d.maDeThi,
          };
        })
      ),
      onFilter: (value, record) => record.maDeThi.includes(value),
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
      title: "Chuyên đề",
      dataIndex: "tenChuyenDeDaoTao",
      key: "tenChuyenDeDaoTao",
      align: "left",
      width: 250,
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
      title: (
        <div>
          Số lượng
          <br />
          câu hỏi
        </div>
      ),
      dataIndex: "soLuongCauHoi",
      key: "soLuongCauHoi",
      align: "center",
      width: 80,
    },
    {
      title: "Thang điểm",
      dataIndex: "thangDiem",
      key: "thangDiem",
      align: "center",
      width: 80,
    },
    {
      title: (
        <div>
          Thời gian
          <br />
          làm bài
        </div>
      ),
      dataIndex: "thoiGianLamBai",
      key: "thoiGianLamBai",
      align: "center",
      width: 80,
    },
    {
      title: "Người lập",
      dataIndex: "nguoiTao",
      key: "nguoiTao",
      align: "center",
      width: 150,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.nguoiTao,
            value: d.nguoiTao,
          };
        })
      ),
      onFilter: (value, record) => record.nguoiTao.includes(value),
      filterSearch: true,
    },
    {
      title: "Ghi chú",
      dataIndex: "moTa",
      key: "moTa",
      align: "left",
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

  let columnLichSuThi = [
    {
      title: "Lần thi",
      dataIndex: "lanThiThu",
      key: "lanThiThu",
      width: 80,
      align: "center",
    },
    {
      title: "Thời gian bắt đầu",
      dataIndex: "thoiGianBatDau",
      key: "thoiGianBatDau",
      align: "center",
      width: 150,
    },
    {
      title: "Thời gian nộp bài",
      dataIndex: "thoiGianKetThuc",
      key: "thoiGianKetThuc",
      align: "center",
      width: 150,
    },
    {
      title: "Số câu đúng",
      dataIndex: "soCauTraLoiDung",
      key: "soCauTraLoiDung",
      align: "center",
      width: 150,
    },
    {
      title: "Số điểm",
      dataIndex: "soDiem",
      key: "soDiem",
      align: "center",
      width: 150,
    },
    {
      title: "Kết quả",
      dataIndex: "ketQua",
      key: "ketQua",
      align: "center",
      width: 150,
      render: (value) => (
        <div>
          {value && (
            <Tag
              color={value === "Không đạt" ? "red" : "blue"}
              style={{
                fontSize: 13,
              }}
            >
              {value}
            </Tag>
          )}
        </div>
      ),
    },
  ];

  const handleRedirect = () => {
    history.push({
      pathname: `${match.url}/them-moi`,
    });
  };

  const addButtonRender = () => {
    return (
      <>
        <Button
          icon={<PlusOutlined />}
          className="th-margin-bottom-0"
          type="primary"
          onClick={handleRedirect}
          disabled={permission && !permission.add}
        >
          Thêm mới
        </Button>
      </>
    );
  };

  const handleOnSelectKienThuc = (value) => {
    setKienThuc(value);
    setChuyenDeDaoTao(null);
    getListChuyenDeDaoTao(value);
    getListData(value, ChuyenDeDaoTao, keyword, page);
  };

  const handleClearKienThuc = () => {
    setKienThuc(null);
    setChuyenDeDaoTao(null);
    getListData(null, null, keyword, page);
  };

  const handleOnSelectChuyenDeDaoTao = (value) => {
    setChuyenDeDaoTao(value);
    getListData(KienThuc, value, keyword, page);
  };

  const handleClearChuyenDeDaoTao = () => {
    setChuyenDeDaoTao(null);
    getListData(KienThuc, null, keyword, page);
  };

  const handleRefesh = () => {
    handleChiTiet(id);
  };

  return (
    <div className="gx-main-content">
      <ContainerHeader
        title={"Ngân hàng đề thi"}
        description="Danh sách ngân hàng đề thi"
        buttons={addButtonRender()}
      />
      <Card className="th-card-margin-bottom ">
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
              optionsvalue={["id", "tenKienThuc"]}
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
              optionsvalue={["id", "tenChuyenDeDaoTao"]}
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
            <span>Tìm kiếm:</span>
            <Toolbar
              count={1}
              search={{
                title: "Tìm kiếm",
                loading,
                value: keyword,
                onChange: onChangeKeyword,
                onPressEnter: onSearchDeThi,
                onSearch: onSearchDeThi,
                placeholder: "Nhập từ khóa",
                allowClear: true,
              }}
            />
          </Col>
        </Row>
      </Card>
      <Card className="th-card-margin-bottom th-card-reset-margin">
        <Table
          bordered
          columns={columns}
          scroll={{ x: 1500, y: "48vh" }}
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
        title={`ĐỀ THI ${DataChiTiet && DataChiTiet.maDeThi}`}
        className="th-card-reset-margin"
        open={ActiveModalChiTietDeThi}
        width={width >= 1600 ? `70%` : width >= 1200 ? `80%` : "100%"}
        closable={true}
        onCancel={() => {
          setActiveModalChiTietDeThi(false);
          setDataChiTiet(null);
          setListCauHoi([]);
        }}
        footer={null}
      >
        <Card className="th-card-margin-bottom th-card-reset-margin">
          <Row gutter={[0, 10]}>
            <Col
              lg={12}
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
              {DataChiTiet && (
                <span
                  style={{
                    width: "calc(100% - 100px)",
                  }}
                >
                  {DataChiTiet.tenDeThi}
                </span>
              )}
            </Col>
            <Col
              lg={12}
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
                Chuyên đề:
              </span>
              {DataChiTiet && (
                <span
                  style={{
                    width: "calc(100% - 100px)",
                  }}
                >
                  {DataChiTiet.tenChuyenDeDaoTao}
                </span>
              )}
            </Col>
            <Col
              lg={12}
              xs={24}
              style={{
                display: "flex",
                alignItems: "flex-start",
              }}
            >
              <span
                style={{
                  width: "130px",
                  fontWeight: "bold",
                }}
              >
                Số lượng câu hỏi:
              </span>
              {DataChiTiet && (
                <span
                  style={{
                    width: "calc(100% - 130px)",
                  }}
                >
                  {DataChiTiet.soLuongCauHoi} câu
                </span>
              )}
            </Col>
            <Col
              lg={12}
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
                Thang điểm:
              </span>
              {DataChiTiet && (
                <span
                  style={{
                    width: "calc(100% - 100px)",
                  }}
                >
                  {DataChiTiet.thangDiem} điểm
                </span>
              )}
            </Col>
            <Col
              lg={12}
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
                Thời gian làm bài:
              </span>
              {DataChiTiet && (
                <span
                  style={{
                    width: "calc(100% - 140px)",
                  }}
                >
                  {DataChiTiet.thoiGianLamBai} phút
                </span>
              )}
            </Col>
            <Col
              lg={12}
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
                Người tạo:
              </span>
              {DataChiTiet && (
                <span
                  style={{
                    width: "calc(100% - 100px)",
                  }}
                >
                  {DataChiTiet.nguoiTao}
                </span>
              )}
            </Col>
            <Col
              lg={12}
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
                Ngày tạo:
              </span>
              {DataChiTiet && (
                <span
                  style={{
                    width: "calc(100% - 100px)",
                  }}
                >
                  {DataChiTiet.ngayTao}
                </span>
              )}
            </Col>
            <Col
              lg={12}
              xs={24}
              style={{
                display: "flex",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  width: "150px",
                  fontWeight: "bold",
                }}
              >
                Trạng thái sử dụng:
              </span>
              {DataChiTiet && (
                <span
                  style={{
                    width: "calc(100% - 150px)",
                  }}
                >
                  <Checkbox checked={DataChiTiet.isSuDung} disabled />
                </span>
              )}
            </Col>
          </Row>
          <div align={"end"}>
            {DataChiTiet && DataChiTiet.lichSus.length ? (
              <Button
                className="th-margin-bottom-0"
                onClick={() => {
                  setLichSuThiThu(DataChiTiet.lichSus);
                  setActiveModalLichSuThiThu(true);
                  setActiveModalChiTietDeThi(false);
                }}
                type={"primary"}
              >
                Xem lịch sử thi
              </Button>
            ) : null}
            <Button
              className="th-margin-bottom-0"
              onClick={() => {
                setActiveModalThiThu(true);
                setActiveModalChiTietDeThi(false);
              }}
              type={
                DataChiTiet && DataChiTiet.isDangThiThu ? "danger" : "primary"
              }
            >
              {DataChiTiet && DataChiTiet.isDangThiThu ? "Tiếp tục" : "Thi thử"}
            </Button>
          </div>
        </Card>
        <Card
          className="th-card-margin-bottom th-card-reset-margin"
          title={"Danh sách câu hỏi"}
        >
          <Row
            gutter={[0, 15]}
            style={{ maxHeight: "35vh", overflowY: "auto" }}
          >
            {ListCauHoi.length &&
              ListCauHoi.map((cauhoi, index) => {
                return (
                  <Col span={24}>
                    <Row gutter={[0, 5]}>
                      <Col span={24}>
                        <span
                          style={{
                            fontWeight: "bold",
                          }}
                        >
                          Câu {index + 1}. ({DataChiTiet.soDiemMoiCau} điểm):{" "}
                          {cauhoi.noiDung}
                        </span>
                      </Col>
                      {cauhoi.hinhAnh || cauhoi.video ? (
                        <Col
                          span={24}
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          {cauhoi.hinhAnh && (
                            <div
                              style={{
                                flex: "1",
                                textAlign: "center",
                                padding: "0 10px",
                              }}
                            >
                              <Image
                                src={BASE_URL_API + cauhoi.hinhAnh}
                                alt="Hình ảnh"
                                style={{ height: "150px" }}
                              />
                            </div>
                          )}
                          {cauhoi.video && (
                            <div
                              style={{
                                flex: "1",
                                textAlign: "center",
                                padding: "0 10px",
                              }}
                            >
                              {cauhoi.video.endsWith(".mp4") ? (
                                <ReactPlayer
                                  style={{ cursor: "pointer" }}
                                  url={BASE_URL_API + cauhoi.video}
                                  width="240px"
                                  height="150px"
                                  playing={true}
                                  muted={true}
                                  controls={false}
                                  onClick={() => {
                                    window.open(
                                      BASE_URL_API + cauhoi.video,
                                      "_blank"
                                    );
                                  }}
                                />
                              ) : (
                                <a
                                  target="_blank"
                                  href={BASE_URL_API + cauhoi.video}
                                  rel="noopener noreferrer"
                                >
                                  {cauhoi.video.split("/")[5]}
                                </a>
                              )}
                            </div>
                          )}
                        </Col>
                      ) : null}
                      {cauhoi.list_DapAns &&
                        cauhoi.list_DapAns.map((dapan, index) => {
                          return (
                            <Col
                              span={24}
                              style={{
                                display: "flex",
                                alignItems: "flex-start",
                              }}
                            >
                              <span
                                style={{
                                  width: "30px",
                                }}
                              >
                                {String.fromCharCode(65 + index)}.
                              </span>
                              <span
                                style={{
                                  width: "calc(100% - 30px)",
                                }}
                              >
                                {dapan.dapAn}
                              </span>
                            </Col>
                          );
                        })}
                    </Row>
                  </Col>
                );
              })}
          </Row>
        </Card>
      </AntModal>
      <AntModal
        title={"Lịch sử thi thử"}
        className="th-card-reset-margin"
        open={ActiveModalLichSuThiThu}
        width={width > 1200 ? `70%` : "100%"}
        closable={true}
        onCancel={() => {
          setActiveModalLichSuThiThu(false);
          setActiveModalChiTietDeThi(true);
        }}
        footer={null}
      >
        <Table
          bordered
          columns={columnLichSuThi}
          components={components}
          scroll={{ x: 1000, y: "65vh" }}
          className="gx-table-responsive th-table"
          dataSource={LichSuThiThu}
          size="small"
          loading={loading}
          pagination={false}
        />
      </AntModal>
      <ModalThiThu
        openModal={ActiveModalThiThu}
        openModalFS={setActiveModalThiThu}
        dethi={DataChiTiet}
        refesh={handleRefesh}
      />
    </div>
  );
}

export default NganHangDeThi;
