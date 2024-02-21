import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Card, Col, Divider } from "antd";
import find from "lodash/find";
import isEmpty from "lodash/isEmpty";
import map from "lodash/map";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  removeDuplicates,
  reDataForTable,
  treeToFlatlist,
} from "src/util/Common";
import { fetchReset, fetchStart } from "src/appRedux/actions/Common";
import {
  EditableTableRow,
  ModalDeleteConfirm,
  Table,
  Toolbar,
} from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";
import { convertObjectToUrlParams, getLocalStorage } from "src/util/Common";
import ImportPhongBan from "./ImportPhongBan";
import { repeat } from "lodash";

const { EditableRow, EditableCell } = EditableTableRow;

function PhongBan({ permission, history }) {
  const dispatch = useDispatch();
  const INFO = getLocalStorage("menu");
  const { width, data, loading } = useSelector(({ common }) => common).toJS();
  const [keyword, setKeyword] = useState("");

  const { totalRow } = data;
  const [ActiveModal, setActiveModal] = useState(false);

  useEffect(() => {
    if (permission && permission.view) {
      getListData(keyword);
    } else if ((permission && !permission.view) || permission === undefined) {
      history.push("/home");
    }
    return () => dispatch(fetchReset());

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  /**
   * Load danh sách người dùng
   * @param keyword Từ khóa
   * @param page Trang
   * @param
   */
  const getListData = (keyword) => {
    let param = convertObjectToUrlParams({ keyword, donviid: INFO.donVi_Id });
    dispatch(
      fetchStart(`Phongban/phong-ban-tree?${param}`, "GET", null, "LIST")
    );
  };

  /**
   * Tìm kiếm người dùng
   *
   */
  const onSearchNguoiDung = () => {
    getListData(keyword);
  };

  /**
   * Thay đổi keyword
   *
   * @param {*} val
   */
  const onChangeKeyword = (val) => {
    setKeyword(val.target.value);
    if (isEmpty(val.target.value)) {
      getListData(val.target.value);
    }
  };
  /**
   * deleteItemFunc: Remove item from list
   * @param {object} item
   * @returns
   * @memberof VaiTro
   */
  const deleteItemFunc = (item) => {
    const title = "Ban/Phòng";
    ModalDeleteConfirm(deleteItemAction, item, item.tenPhongBan, title);
  };

  /**
   * Remove item
   *
   * @param {*} item
   */
  const deleteItemAction = (item) => {
    let url = `Phongban/${item.id}`;
    new Promise((resolve, reject) => {
      dispatch(fetchStart(url, "DELETE", null, "DELETE", "", resolve, reject));
    })
      .then((res) => {
        getListData(keyword);
      })
      .catch((error) => console.error(error));
  };

  /**
   * ActionContent: Action in table
   * @param {*} item
   * @returns View
   * @memberof ChucNang
   */
  const actionContent = (item) => {
    const editItem =
      permission && permission.edit ? (
        <Link
          to={{
            pathname: `/danh-muc-kho-tpc/ban-phong/${item.id}/chinh-sua`,
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

  /**
   * Save item from table
   * @param {object} row
   * @memberof ChucNang
   */
  const handleSave = async (row) => {
    const dataValue = treeToFlatlist(data);
    // Check data not change
    const item = find(dataValue, (item) => item.id === row.id);
    if (!isEmpty(item)) {
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `Phongban/${item.id}`,
            "PUT",
            {
              ...item,
              thuTu: row.thuTu,
            },
            "EDIT",
            "",
            resolve,
            reject
          )
        );
      })
        .then((res) => {
          if (res && res.status === 204) {
            getListData(keyword);
          }
        })
        .catch((error) => console.error(error));
    }
  };
  let dataList = treeToFlatlist(data);
  dataList = reDataForTable(dataList);
  /**
   * Thêm dấu để phân cấp tiêu đề dựa theo tree (flatlist)
   *
   * @param {*} value
   * @param {*} record
   * @returns
   * @memberof ChucNang
   */
  const renderTenMenu = (value, record) => {
    let string = repeat("- ", record.level);
    string = `${string} ${value}`;
    return <div>{string}</div>;
  };
  let colValues = [
    {
      title: "Chức năng",
      key: "action",
      align: "center",
      width: 80,
      render: (value) => actionContent(value),
    },
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      width: 45,
      align: "center",
    },
    {
      title: "Mã Ban/Phòng",
      dataIndex: "maPhongBan",
      key: "maPhongBan",
      align: "center",
      render: (value, record) => renderTenMenu(value, record),
      width: 150,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.maPhongBan,
            value: d.maPhongBan,
          };
        })
      ),
      onFilter: (value, record) => record.maPhongBan.includes(value),
      filterSearch: true,
    },
    {
      title: "Tên Ban/Phòng",
      dataIndex: "tenPhongBan",
      key: "tenPhongBan",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenPhongBan,
            value: d.tenPhongBan,
          };
        })
      ),
      onFilter: (value, record) => record.tenPhongBan.includes(value),
      filterSearch: true,
    },
    {
      title: "Đơn vị",
      dataIndex: "tenDonVi",
      key: "tenDonVi",
      align: "left",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenDonVi,
            value: d.tenDonVi,
          };
        })
      ),
      onFilter: (value, record) => record.tenDonVi.includes(value),
      filterSearch: true,
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
        handleSave: handleSave,
      }),
    };
  });

  const handleRedirect = () => {
    history.push({
      pathname: "/danh-muc-kho-tpc/ban-phong/them-moi",
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
  const refeshData = () => {
    // getListData(DonVi, keyword, page);
  };
  return (
    <div className="gx-main-content">
      <ContainerHeader
        title={"Danh mục Ban/Phòng"}
        description="Danh sách Ban/Phòng"
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
          }}
        >
          <span
            style={{
              width: "80px",
            }}
          >
            Tìm kiếm:
          </span>
          <div
            style={{
              flex: 1,
              alignItems: "center",
              marginTop: width < 576 ? 10 : 0,
            }}
          >
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
              }}
            />
          </div>
        </Col>
      </Card>
      <Card className="th-card-margin-bottom th-card-reset-margin">
        <Table
          bordered
          columns={columns}
          scroll={{ x: 700, y: "55vh" }}
          components={components}
          className="gx-table-responsive"
          dataSource={dataList}
          size="small"
          rowClassName={"editable-row"}
          pagination={{
            pageSize: 20,
            total: totalRow,
            showSizeChanger: false,
            showQuickJumper: true,
          }}
          loading={loading}
        />
        <ImportPhongBan
          openModal={ActiveModal}
          openModalFS={setActiveModal}
          refresh={refeshData}
        />
      </Card>
    </div>
  );
}

export default PhongBan;
