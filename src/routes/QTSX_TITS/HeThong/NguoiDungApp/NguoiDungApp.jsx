import React, { useState, useEffect } from "react";
import { Card, Button, Tag, Divider } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  UnlockOutlined,
  LockOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import isEmpty from "lodash/isEmpty";
import map from "lodash/map";
import { Table, Toolbar, ModalDeleteConfirm } from "src/components/Common";
import { fetchStart, fetchReset } from "src/appRedux/actions/Common";
import {
  convertObjectToUrlParams,
  getLocalStorage,
  reDataForTable,
  removeDuplicates,
} from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";

function NguoiDungApp({ match, history, permission }) {
  const [keyword, setKeyword] = useState("");
  const dispatch = useDispatch();
  const INFO = getLocalStorage("menu");
  const { data, loading, width } = useSelector(({ common }) => common).toJS();
  useEffect(() => {
    if (permission && permission.view) {
      getListData(keyword);
    } else if (permission && !permission.view) {
      history.push("/home");
    }
    return () => {
      dispatch(fetchReset());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Load danh sách người dùng
   * @param keyword Từ khóa
   * @param page Trang
   */
  const getListData = (keyword) => {
    let param = convertObjectToUrlParams({
      keyword,
    });
    dispatch(
      fetchStart(
        `tits_qtsx_AppMobile_Menu/get-menu-user?${param}`,
        "GET",
        null,
        "LIST"
      )
    );
  };

  /**
   * Chuyển tới trang thêm mới người dùng
   *
   */
  const handleRedirect = () => {
    history.push(`${match.path}/them-moi`);
  };

  /**
   * Render trạng thái kích hoạt của người dùng
   *
   * @param {*} value
   * @param {*} record
   * @returns
   */
  const activeNguoiDung = (value, record) => {
    if (value) {
      return (
        <UnlockOutlined
          style={{ color: "green", fontSize: 16 }}
          onClick={() => callActiveNguoiDung(record)}
        />
      );
    }
    return (
      <LockOutlined
        style={{ color: "red", fontSize: 16 }}
        onClick={() => callActiveNguoiDung(record)}
      />
    );
  };

  /**
   * Gọi API đổi trạng thái người dùng
   *
   * @param {*} id
   */
  const callActiveNguoiDung = (record) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_AppMobile_Menu/active-appmobile-menu-user/${record.tits_qtsx_AppMobile_User_Id}`,
          "POST",
          null,
          "EDIT",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res.status === 200) {
          getListData(keyword);
        }
      })
      .catch((err) => console.error(err));
  };
  /**
   * deleteItemFunc: Remove item from list
   * @param {object} item
   * @returns
   * @memberof VaiTro
   */
  const deleteItemFunc = (item) => {
    const title = "người dùng";
    ModalDeleteConfirm(deleteItemAction, item, item.tenNguoiDung, title);
  };

  /**
   * Remove item
   *
   * @param {*} item
   */
  const deleteItemAction = (item) => {
    let url = `tits_qtsx_AppMobile_Menu/delete-appmobile-menu-user/${item.tits_qtsx_AppMobile_User_Id}`;
    new Promise((resolve, reject) => {
      dispatch(fetchStart(url, "DELETE", null, "DELETE", "", resolve, reject));
    })
      .then((res) => {
        if (res.status !== 409) {
          getListData(keyword, INFO);
        }
      })
      .catch((error) => console.error(error));
  };
  /**
   * ActionContent: Hành động trên bảng
   *
   * @param {*} item
   * @returns View
   */
  const actionContent = (item) => {
    const editItem =
      permission && permission.edit ? (
        <Link
          to={{
            pathname: `${match.path}/${item.tits_qtsx_AppMobile_User_Id}/chinh-sua`,
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
      <React.Fragment>
        {editItem}
        <Divider type="vertical" />
        <a {...deleteItemVal} title="Xóa">
          <DeleteOutlined />
        </a>
      </React.Fragment>
    );
  };

  /**
   * Tìm kiếm người dùng
   *
   */
  const onSearchNguoiDung = () => {
    getListData(keyword, INFO);
  };

  /**
   * Thay đổi keyword
   *
   * @param {*} val
   */
  const onChangeKeyword = (val) => {
    setKeyword(val.target.value);
    if (isEmpty(val.target.value)) {
      getListData(val.target.value, INFO);
    }
  };
  /**
   * Hiển thị tag quyền
   *
   * @param {*} val
   * @returns
   */
  const renderDisplayName = (val) => {
    if (!isEmpty(val)) {
      return map(val, (item, index) => {
        let color = "green";
        return (
          <Tag key={index} color={color}>
            {item.maQuyenMobile}
          </Tag>
        );
      });
    }
    return null;
  };
  /**
   * Hiển thị bảng
   *
   * @returns
   */
  const header = () => {
    let renderHead = [
      {
        title: "STT",
        dataIndex: "key",
        key: "key",
        width: 50,
        align: "center",
      },
      {
        title: "Quyền",
        dataIndex: "tits_qtsx_ChiTiets",
        key: "tits_qtsx_ChiTiets",
        align: "center",
        render: (val) => renderDisplayName(JSON.parse(val)),
      },
      {
        title: "Mã nhân viên",
        dataIndex: "maNhanVien",
        key: "maNhanVien",
        width: 150,
        align: "center",
        filters: removeDuplicates(
          map(dataList, (d) => {
            return {
              text: d.maNhanVien,
              value: d.maNhanVien,
            };
          })
        ),
        filterSearch: true,
        onFilter: (value, record) => record.maNhanVien.includes(value),
      },
      {
        title: "Họ tên",
        dataIndex: "tenNguoiDung",
        align: "center",
        key: "tenNguoiDung",
        filters: removeDuplicates(
          map(dataList, (d) => {
            return {
              text: d.tenNguoiDung,
              value: d.tenNguoiDung,
            };
          })
        ),
        filterSearch: true,
        onFilter: (value, record) => record.tenNguoiDung.includes(value),
      },
      { title: "Email", dataIndex: "email", key: "email", align: "center" },
    ];
    if (permission && permission.edit) {
      renderHead = [
        ...renderHead,
        {
          title: "Trạng thái",
          key: "isActive",
          dataIndex: "isActive",
          align: "center",
          width: 80,
          render: (value, record) => activeNguoiDung(value, record),
        },
      ];
    }
    renderHead = [
      ...renderHead,
      {
        title: "Chức năng",
        key: "action",
        align: "center",
        width: 80,
        render: (value) => actionContent(value),
        fixed: width > 700 && "right",
      },
    ];
    return renderHead;
  };

  const addButtonRender = () => {
    return (
      <Button
        icon={<PlusOutlined />}
        className="th-margin-bottom-0"
        type="primary"
        onClick={handleRedirect}
        disabled={permission && !permission.add}
      >
        Thêm người dùng
      </Button>
    );
  };

  const dataList = reDataForTable(data);
  return (
    <div className="gx-main-content">
      <ContainerHeader
        title="Người dùng APP"
        description="Danh sách người dùng"
        buttons={addButtonRender()}
      />
      <Card className="th-card-margin-bottom">
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
      </Card>
      <Card className="th-card-margin-bottom th-card-reset-margin">
        <Table
          bordered
          scroll={{ x: 1200, y: "55vh" }}
          columns={header()}
          className="gx-table-responsive"
          dataSource={dataList}
          size="small"
          pagination={{
            pageSize: 20,
            showSizeChanger: false,
            showQuickJumper: true,
          }}
          loading={loading}
        />
      </Card>
    </div>
  );
}

export default NguoiDungApp;
