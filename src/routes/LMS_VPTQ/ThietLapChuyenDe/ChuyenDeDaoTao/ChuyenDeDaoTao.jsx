import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Card, Checkbox, Col, Divider, Row } from "antd";
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
import { BASE_URL_API } from "src/constants/Config";
import ReactPlayer from "react-player";

const { EditableRow, EditableCell } = EditableTableRow;

function ChuyenDeDaoTao({ permission, history, match }) {
  const dispatch = useDispatch();
  const { loading } = useSelector(({ common }) => common).toJS();
  const [Data, setData] = useState([]);
  const [ListKienThuc, setListKienThuc] = useState([]);
  const [KienThuc, setKienThuc] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (permission && permission.view) {
      getListKienThuc();
      getListData(KienThuc, keyword, page);
    } else if ((permission && !permission.view) || permission === undefined) {
      history.push("/home");
    }
    return () => dispatch(fetchReset());

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getListData = (vptq_lms_KienThuc_Id, keyword, page) => {
    let param = convertObjectToUrlParams({
      vptq_lms_KienThuc_Id,
      keyword,
      page,
    });
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

  const handleTableChange = (pagination) => {
    setPage(pagination);
    getListData(KienThuc, keyword, pagination);
  };

  const onSearchChuyenDeDaoTao = () => {
    getListData(KienThuc, keyword, page);
  };

  const onChangeKeyword = (val) => {
    setKeyword(val.target.value);
    if (isEmpty(val.target.value)) {
      getListData(KienThuc, val.target.value, page);
    }
  };

  const deleteItemFunc = (item) => {
    const title = "chuyên đề đào tạo";
    ModalDeleteConfirm(deleteItemAction, item, item.tenChuyenDeDaoTao, title);
  };

  const deleteItemAction = (item) => {
    let url = `vptq_lms_ChuyenDeDaoTao/${item.id}`;
    new Promise((resolve, reject) => {
      dispatch(fetchStart(url, "DELETE", null, "DELETE", "", resolve, reject));
    })
      .then((res) => {
        getListData(KienThuc, keyword, page);
      })
      .catch((error) => console.error(error));
  };

  const actionContent = (item) => {
    const editItem =
      permission && permission.edit ? (
        <Link
          to={{
            pathname: `${match.url}/${item.id}/chinh-sua`,
            state: { itemData: item, permission },
          }}
          title="Sửa"
        >
          <EditOutlined />
        </Link>
      ) : (
        <span disabled title="Sửa">
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
          {editItem}
          <Divider type="vertical" />
          <a {...deleteItemVal} title="Xóa">
            <DeleteOutlined />
          </a>
        </React.Fragment>
      </div>
    );
  };

  const handleChangeSuDung = (value, record) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_ChuyenDeDaoTao/set-su-dung/${record.id}`,
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
          getListData(KienThuc, keyword, page);
        }
      })
      .catch((error) => console.error(error));
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
      title: "Trạng thái sử dụng",
      dataIndex: "isSuDung",
      key: "isSuDung",
      align: "center",
      width: 80,
      fixed: "left",
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
      title: "STT",
      dataIndex: "key",
      key: "key",
      width: 50,
      align: "center",
    },
    {
      title: (
        <div>
          Mã <br />
          chuyên đề
        </div>
      ),
      dataIndex: "maChuyenDeDaoTao",
      key: "maChuyenDeDaoTao",
      align: "center",
      width: 100,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.maChuyenDeDaoTao,
            value: d.maChuyenDeDaoTao,
          };
        })
      ),
      onFilter: (value, record) => record.maChuyenDeDaoTao.includes(value),
      filterSearch: true,
    },
    {
      title: "Tên chuyên đề",
      dataIndex: "tenChuyenDeDaoTao",
      key: "tenChuyenDeDaoTao",
      align: "left",
      width: 150,
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
      title: "Thời lượng",
      dataIndex: "thoiLuongDaoTao",
      key: "thoiLuongDaoTao",
      align: "center",
      width: 100,
      filters: removeDuplicates(
        map(dataList, (d) => {
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
        return <span>{value} phút</span>;
      },
    },
    {
      title: "Mô tả",
      dataIndex: "moTa",
      key: "moTa",
      align: "left",
      width: 300,
    },
    {
      title: "Kiến thức",
      dataIndex: "tenKienThuc",
      key: "tenKienThuc",
      align: "left",
      width: 130,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenKienThuc,
            value: d.tenKienThuc,
          };
        })
      ),
      onFilter: (value, record) => record.tenKienThuc.includes(value),
      filterSearch: true,
    },
    {
      title: (
        <div>
          Hình thức <br />
          đào tạo
        </div>
      ),
      dataIndex: "tenHinhThucDaoTao",
      key: "tenHinhThucDaoTao",
      align: "left",
      width: 130,
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
      title: "Giảng viên",
      dataIndex: "tenGiangVien",
      key: "tenGiangVien",
      align: "left",
      width: 130,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenGiangVien,
            value: d.tenGiangVien,
          };
        })
      ),
      onFilter: (value, record) => record.tenGiangVien.includes(value),
      filterSearch: true,
    },
    {
      title: "Bài giảng bằng video",
      dataIndex: "fileVideo",
      key: "fileVideo",
      align: "center",
      width: 200,
      render: (value) => {
        return (
          value && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <ReactPlayer
                style={{ cursor: "pointer" }}
                url={BASE_URL_API + value}
                width="100px"
                height="100px"
                playing={false}
                muted={true}
                controls={false}
                onClick={() => {
                  window.open(BASE_URL_API + value, "_blank");
                }}
              />
            </div>
          )
        );
      },
    },
    {
      title: "Tài liệu",
      dataIndex: "fileTaiLieu",
      key: "fileTaiLieu",
      align: "left",
      width: 200,
      render: (value) => {
        return (
          value && (
            <span>
              <a
                target="_blank"
                href={BASE_URL_API + value}
                rel="noopener noreferrer"
              >
                {value.split("/")[5]}
              </a>
            </span>
          )
        );
      },
    },
    {
      title: "Ghi chú",
      dataIndex: "ghiChu",
      key: "ghiChu",
      align: "left",
      width: 130,
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
      </>
    );
  };

  const handleOnSelectKienThuc = (value) => {
    setKienThuc(value);
    getListData(value, keyword, page);
  };

  const handleClearKienThuc = () => {
    setKienThuc(null);
    getListData(null, keyword, page);
  };

  return (
    <div className="gx-main-content">
      <ContainerHeader
        title={"Chuyên đề đào tạo"}
        description="Danh sách chuyên đề đào tạo"
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
            xxl={5}
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
                onPressEnter: onSearchChuyenDeDaoTao,
                onSearch: onSearchChuyenDeDaoTao,
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
          scroll={{ x: 2000, y: "49vh" }}
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
    </div>
  );
}

export default ChuyenDeDaoTao;
