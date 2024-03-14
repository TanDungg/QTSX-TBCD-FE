import { Button, Card, Col, Divider, Input } from "antd";
import isEmpty from "lodash/isEmpty";
import map from "lodash/map";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions/Common";
import {
  EditableTableRow,
  ModalDeleteConfirm,
  Table,
  Toolbar,
} from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";
import {
  convertObjectToUrlParams,
  getTokenInfo,
  getLocalStorage,
  removeDuplicates,
  reDataForTable,
} from "src/util/Common";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";

const { EditableRow, EditableCell } = EditableTableRow;

function CongDoan({ history, permission, match }) {
  const dispatch = useDispatch();
  const { loading } = useSelector(({ common }) => common).toJS();
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };
  const [Data, setData] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [editingRecord, setEditingRecord] = useState([]);

  useEffect(() => {
    if (permission && permission.view) {
      getListData(keyword, page);
    } else if ((permission && !permission.view) || permission === undefined) {
      history.push("/home");
    }
    return () => dispatch(fetchReset());
  }, []);

  const getListData = (keyword, page) => {
    let param = convertObjectToUrlParams({
      donVi_Id: INFO.donVi_Id,
      keyword,
      page,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tsec_qtsx_CongDoan?${param}`,
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

  const handleTableChange = (pagination) => {
    setPage(pagination);
    getListData(keyword, pagination);
  };

  const onSearchNguoiDung = () => {
    getListData(keyword, page);
  };

  const onChangeKeyword = (val) => {
    setKeyword(val.target.value);
    if (isEmpty(val.target.value)) {
      getListData(val.target.value, page);
    }
  };

  const handleClearSearch = () => {
    getListData(null, 1);
  };

  const deleteItemFunc = (item) => {
    const title = "công đoạn";
    ModalDeleteConfirm(deleteItemAction, item, item.tenCongDoan, title);
  };

  const deleteItemAction = (item) => {
    let url = `tsec_qtsx_CongDoan/${item.id}`;
    new Promise((resolve, reject) => {
      dispatch(fetchStart(url, "DELETE", null, "DELETE", "", resolve, reject));
    })
      .then((res) => {
        getListData(keyword, page);
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
      permission && permission.del
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

  const { totalRow, pageSize } = Data;

  const ChangeThuTu = (val, item) => {
    const ThuTu = val.target.value;

    if (!ThuTu || Number(ThuTu) <= 0) {
      setEditingRecord([
        ...editingRecord,
        { ...item, message: "Thứ tự phải là số lớn hơn 0 và bắt buộc" },
      ]);
    } else {
      const newData = editingRecord.filter((d) => d.id !== item.id);
      setEditingRecord(newData);
    }

    const newData = {
      ...Data,
      datalist:
        Data &&
        Data.datalist.map((dt) => {
          if (dt.id === item.id) {
            return {
              ...dt,
              thuTu: ThuTu,
            };
          }
          return dt;
        }),
    };

    setData(newData);
  };

  const handleChangeThuTu = (val, item) => {
    const newData = {
      tsec_qtsx_CongDoan_Id: item.id,
      thuTu: val.target.value,
    };
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tsec_qtsx_CongDoan/put-thu-tu-cong-doan`,
          "PUT",
          newData,
          "EDIT",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res && res.status !== 409) {
          getListData(keyword, page);
        }
      })
      .catch((error) => console.error(error));
  };

  const renderThuTu = (item) => {
    let isEditing = false;
    let message = "";
    editingRecord.forEach((ct) => {
      if (ct.id === item.id) {
        isEditing = true;
        message = ct.message;
      }
    });
    return (
      <>
        <Input
          style={{
            textAlign: "center",
            width: "100%",
          }}
          className={`input-item`}
          type="number"
          value={item.thuTu}
          onBlur={(value) => !isEditing && handleChangeThuTu(value, item)}
          onChange={(value) => ChangeThuTu(value, item)}
        />
        {isEditing && <div style={{ color: "red" }}>{message}</div>}
      </>
    );
  };

  let colValues = [
    {
      title: "Chức năng",
      key: "action",
      align: "center",
      width: 100,
      render: (value) => actionContent(value),
    },
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      width: 50,
      align: "center",
    },
    {
      title: "Thứ tự",
      key: "thuTu",
      align: "center",
      width: 100,
      render: (record) => renderThuTu(record),
    },
    {
      title: "Mã công đoạn",
      dataIndex: "maCongDoan",
      key: "maCongDoan",
      align: "center",
      width: 150,
      filters: removeDuplicates(
        map(Data.datalist, (d) => {
          return {
            text: d.maCongDoan,
            value: d.maCongDoan,
          };
        })
      ),
      onFilter: (value, record) => record.maCongDoan.includes(value),
      filterSearch: true,
    },
    {
      title: "Tên công đoạn",
      dataIndex: "tenCongDoan",
      key: "tenCongDoan",
      align: "center",
      width: 250,
      filters: removeDuplicates(
        map(Data.datalist, (d) => {
          return {
            text: d.tenCongDoan,
            value: d.tenCongDoan,
          };
        })
      ),
      onFilter: (value, record) => record.tenCongDoan.includes(value),
      filterSearch: true,
    },
    {
      title: "Ghi chú",
      dataIndex: "moTa",
      key: "moTa",
      align: "center",
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
          className="th-margin-bottom-0 btn-margin-bottom-0"
          type="primary"
          onClick={handleRedirect}
          disabled={permission && !permission.add}
        >
          Thêm mới
        </Button>
      </>
    );
  };

  return (
    <div className="gx-main-content">
      <ContainerHeader
        title={"Danh mục công đoạn"}
        description="Danh sách công đoạn"
        buttons={addButtonRender()}
      />
      <Card className="th-card-margin-bottom ">
        <Col
          xxl={8}
          xl={12}
          lg={16}
          md={16}
          sm={20}
          xs={24}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "15px",
            width: "100%",
          }}
        >
          <span style={{ whiteSpace: "nowrap" }}>Tìm kiếm:</span>
          <Toolbar
            count={1}
            search={{
              title: "Tìm kiếm",
              loading,
              value: keyword,
              onChange: onChangeKeyword,
              onPressEnter: onSearchNguoiDung,
              onSearch: onSearchNguoiDung,
              placeholder: "Nhập từ khóa",
              allowClear: true,
              onClear: { handleClearSearch },
            }}
          />
        </Col>
      </Card>
      <Card className="th-card-margin-bottom th-card-reset-margin">
        <Table
          bordered
          columns={columns}
          scroll={{ x: 800, y: "55vh" }}
          components={components}
          className="gx-table-responsive"
          dataSource={Data && reDataForTable(Data.datalist)}
          size="small"
          rowClassName={"editable-row"}
          pagination={{
            onChange: handleTableChange,
            pageSize,
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

export default CongDoan;
