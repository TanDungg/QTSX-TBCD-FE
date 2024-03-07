import {
  DeleteOutlined,
  EditOutlined,
  ImportOutlined,
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
  Image,
} from "antd";
import isEmpty from "lodash/isEmpty";
import map from "lodash/map";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  removeDuplicates,
  reDataForTable,
  getTokenInfo,
  getLocalStorage,
} from "src/util/Common";
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
import { BASE_URL_API } from "src/constants/Config";
import ReactPlayer from "react-player";
import ImportCauHoi from "./ImportCauHoi";

const { EditableRow, EditableCell } = EditableTableRow;

function CauHoi({ permission, history, match }) {
  const dispatch = useDispatch();
  const { loading, width } = useSelector(({ common }) => common).toJS();
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };
  const [Data, setData] = useState([]);
  const [ListKienThuc, setListKienThuc] = useState([]);
  const [KienThuc, setKienThuc] = useState(null);
  const [ListChuyenDeDaoTao, setListChuyenDeDaoTao] = useState([]);
  const [ChuyenDeDaoTao, setChuyenDeDaoTao] = useState(null);
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [DataChiTiet, setDataChiTiet] = useState(null);
  const [ListDapAn, setListDapAn] = useState([]);
  const [DisabledModalChiTiet, setDisabledModalChiTiet] = useState(false);
  const [ActiveImportCauHoi, setActiveImportCauHoi] = useState(false);

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
      donViHienHanh_Id: INFO.donVi_Id,
      vptq_lms_KienThuc_Id,
      vptq_lms_ChuyenDeDaoTao_Id,
      keyword,
      page,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_CauHoi?${param}`,
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
          const newData = res.data
            .filter((dt) => dt.isSuDung === true)
            .map((data) => {
              return {
                ...data,
                chuyenDe: `${data.tenChuyenDeDaoTao} (${data.tenHinhThucDaoTao})`,
              };
            });
          setListChuyenDeDaoTao(newData);
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

  const onSearchCauHoi = () => {
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
          `vptq_lms_CauHoi/${item.id}?donViHienHanh_Id=${INFO.donVi_Id}`,
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
        setDataChiTiet(res.data);
        setListDapAn(res.data.list_ChiTiets);
      } else {
        setDataChiTiet([]);
        setListDapAn([]);
      }
      setDisabledModalChiTiet(true);
    });
  };

  const deleteItemFunc = (item) => {
    const title = "câu hỏi";
    ModalDeleteConfirm(deleteItemAction, item, item.maCauHoi, title);
  };

  const deleteItemAction = (item) => {
    let url = `vptq_lms_CauHoi/${item.id}?donViHienHanh_Id=${INFO.donVi_Id}`;
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
          title="Chỉnh sửa câu hỏi"
        >
          <EditOutlined />
        </Link>
      ) : (
        <span disabled title="Chỉnh sửa câu hỏi">
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
          <a {...detailItem} title="Xem chi tiết câu hỏi">
            <SearchOutlined />
          </a>
          <Divider type="vertical" />
          {editItem}
          <Divider type="vertical" />
          <a {...deleteItemVal} title="Xóa câu hỏi">
            <DeleteOutlined />
          </a>
        </React.Fragment>
      </div>
    );
  };

  const { totalRow, pageSize } = Data;
  const dataList = reDataForTable(Data.datalist, page, pageSize);

  const handleChangeSuDung = (value, record) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_CauHoi/set-su-dung/${record.id}?donViHienHanh_Id=${INFO.donVi_Id}`,
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
            onChange={() => handleChangeSuDung(value, record)}
          />
        );
      },
    },
    {
      title: (
        <div>
          Xáo trộn <br />
          đáp án
        </div>
      ),
      dataIndex: "isXaoDapAn",
      key: "isXaoDapAn",
      align: "center",
      width: 80,
      fixed: width >= 1600 && "left",
      render: (value) => {
        return <Checkbox checked={value} disabled />;
      },
    },
    {
      title: "Mã câu hỏi",
      dataIndex: "maCauHoi",
      key: "maCauHoi",
      align: "center",
      width: 150,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.maCauHoi,
            value: d.maCauHoi,
          };
        })
      ),
      onFilter: (value, record) => record.maCauHoi.includes(value),
      filterSearch: true,
    },
    {
      title: "Nội dung",
      dataIndex: "noiDung",
      key: "noiDung",
      align: "left",
      width: 350,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.noiDung,
            value: d.noiDung,
          };
        })
      ),
      onFilter: (value, record) => record.noiDung.includes(value),
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
      title: "Hình thức đào tạo",
      dataIndex: "tenHinhThucDaoTao",
      key: "tenHinhThucDaoTao",
      align: "left",
      width: 150,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenHinhThucDaoTao,
            value: d.tenHinhThucDaoTao,
          };
        })
      ),
      onFilter: (value, record) => record.tenHinhThucDaoTao.includes(value),
      filterSearch: true,
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
      title: "Hình ảnh",
      dataIndex: "hinhAnh",
      key: "hinhAnh",
      align: "center",
      width: 120,
      render: (value) =>
        value && (
          <span>
            <Image
              src={BASE_URL_API + value}
              alt="Hình ảnh"
              style={{ maxWidth: 70, maxHeight: 70 }}
            />
          </span>
        ),
    },
    {
      title: "Âm thanh/Video",
      dataIndex: "video",
      key: "video",
      align: "center",
      width: 200,
      render: (value) =>
        value && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {value.endsWith(".mp4") ? (
              <ReactPlayer
                style={{
                  cursor: "pointer",
                }}
                url={BASE_URL_API + value}
                width="100px"
                height="60px"
                controls={false}
                muted={true}
                onClick={() => window.open(BASE_URL_API + value, "_blank")}
              />
            ) : (
              <a
                target="_blank"
                href={BASE_URL_API + value}
                rel="noopener noreferrer"
              >
                {value.split("/")[5]}
              </a>
            )}
          </div>
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
        <Button
          icon={<ImportOutlined />}
          className="th-margin-bottom-0"
          type="primary"
          onClick={() => setActiveImportCauHoi(true)}
          disabled={permission && !permission.add}
        >
          Import câu hỏi
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
    getListData(KienThuc, ChuyenDeDaoTao, keyword, page);
  };

  return (
    <div className="gx-main-content">
      <ContainerHeader
        title={"Ngân hàng câu hỏi"}
        description="Danh sách ngân hàng câu hỏi"
        buttons={addButtonRender()}
      />
      <Card className="th-card-margin-bottom ">
        <Row>
          <Col
            xxl={8}
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
            xxl={8}
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
              optionsvalue={["id", "chuyenDe"]}
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
            xxl={8}
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
                onPressEnter: onSearchCauHoi,
                onSearch: onSearchCauHoi,
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
        title={"Chi tiết câu hỏi"}
        className="th-card-reset-margin"
        open={DisabledModalChiTiet}
        width={width >= 1600 ? `60%` : width >= 1200 ? `80%` : "100%"}
        closable={true}
        onCancel={() => setDisabledModalChiTiet(false)}
        footer={null}
      >
        <Card className="th-card-margin-bottom th-card-reset-margin">
          <Row gutter={[0, 15]}>
            <Col span={24} className="title-span">
              <span style={{ whiteSpace: "nowrap" }}>
                <strong>Câu hỏi:</strong>
              </span>
              <span>{DataChiTiet && DataChiTiet.noiDung}</span>
            </Col>
            {DataChiTiet && (DataChiTiet.hinhAnh || DataChiTiet.video) ? (
              <Col
                span={24}
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {DataChiTiet.hinhAnh && (
                  <div
                    style={{
                      flex: "1",
                      textAlign: "center",
                      padding: "0 10px",
                    }}
                  >
                    <Image
                      src={BASE_URL_API + DataChiTiet.hinhAnh}
                      alt="Hình ảnh"
                      style={{ height: "200px" }}
                    />
                  </div>
                )}
                {DataChiTiet.video && (
                  <div
                    style={{
                      flex: "1",
                      textAlign: "center",
                      padding: "0 10px",
                    }}
                  >
                    {DataChiTiet.video.endsWith(".mp4") ? (
                      <ReactPlayer
                        style={{ cursor: "pointer" }}
                        url={BASE_URL_API + DataChiTiet.video}
                        width="280px"
                        height="200px"
                        playing={true}
                        muted={true}
                        controls={false}
                        onClick={() => {
                          window.open(
                            BASE_URL_API + DataChiTiet.video,
                            "_blank"
                          );
                        }}
                      />
                    ) : (
                      <a
                        target="_blank"
                        href={BASE_URL_API + DataChiTiet.video}
                        rel="noopener noreferrer"
                      >
                        {DataChiTiet.video.split("/")[5]}
                      </a>
                    )}
                  </div>
                )}
              </Col>
            ) : null}
          </Row>
          <Divider
            orientation="left"
            backgroundColor="none"
            style={{
              color: "#0469b9",
              background: "none",
              fontWeight: "bold",
            }}
          >
            Đáp án
          </Divider>
          <Row gutter={[0, 10]}>
            {ListDapAn.length &&
              ListDapAn.map((dapan, index) => {
                return (
                  <Col
                    span={24}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      fontWeight: dapan.isCorrect && "bold",
                      backgroundColor: dapan.isCorrect && "#A9FABF",
                      color: dapan.isCorrect && "#0469b9",
                    }}
                    className="title-span"
                  >
                    <span>
                      <strong>{String.fromCharCode(65 + index)}.</strong>
                    </span>
                    <span>{dapan && dapan.dapAn}</span>
                  </Col>
                );
              })}
          </Row>
        </Card>
        <Card
          className="th-card-margin-bottom th-card-reset-margin"
          title={"Thông tin về câu hỏi"}
        >
          <Row gutter={[0, 10]}>
            <Col lg={12} md={12} xs={24} className="title-span">
              <span style={{ whiteSpace: "nowrap" }}>
                <strong>Chuyên đề đào tạo:</strong>
              </span>
              <span>{DataChiTiet && DataChiTiet.tenChuyenDeDaoTao}</span>
            </Col>
            <Col lg={12} md={12} xs={24} className="title-span">
              <span>
                <strong>Người tạo:</strong>
              </span>
              <span>{DataChiTiet && DataChiTiet.nguoiTao}</span>
            </Col>
            <Col lg={12} md={12} xs={24} className="title-span">
              <span>
                <strong>Ngày tạo:</strong>
              </span>
              <span>{DataChiTiet && DataChiTiet.ngayTao}</span>
            </Col>
            <Col lg={12} md={12} xs={24} className="title-span">
              <span>
                <strong>Trạng thái sử dụng:</strong>
              </span>
              <span>
                <Checkbox
                  checked={DataChiTiet && DataChiTiet.isSuDung}
                  style={{ marginTop: "-10px" }}
                  disabled
                />
              </span>
            </Col>
          </Row>
        </Card>
      </AntModal>
      <ImportCauHoi
        openModal={ActiveImportCauHoi}
        openModalFS={setActiveImportCauHoi}
        refesh={handleRefesh}
      />
    </div>
  );
}

export default CauHoi;
