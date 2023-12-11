import React, { useState, useEffect } from "react";
import { Card, Button, Tag, Divider, Row, Col } from "antd";
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

function NguoiDung({ match, history, permission }) {
  const [keyword, setKeyword] = useState("");
  const dispatch = useDispatch();
  const INFO = getLocalStorage("menu");
  const { data, loading, width } = useSelector(({ common }) => common).toJS();
  useEffect(() => {
    if (permission && permission.view) {
      getListData(keyword, INFO);
    } else if ((permission && !permission.view) || permission === undefined) {
      history.push("/home");
    }
    return () => {
      dispatch(fetchReset());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permission]);

  /**
   * Load danh sách người dùng
   * @param keyword Từ khóa
   * @param page Trang
   */
  const getListData = (keyword, INFO) => {
    let param = convertObjectToUrlParams({
      keyword,
      phanMem_id: INFO.phanMem_Id,
      donVi_Id: INFO.donVi_Id,
    });
    dispatch(fetchStart(`PhanMem/user-all-role?${param}`, "GET", null, "LIST"));
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
    const param = convertObjectToUrlParams({
      user_Id: record.user_Id,
      donVi_Id: INFO.donVi_Id,
      phanMem_id: INFO.phanMem_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `PhanMem/active-all-pm-for-cbnv?${param}`,
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
          getListData(keyword, INFO);
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
    ModalDeleteConfirm(deleteItemAction, item, item.fullName, title);
  };

  /**
   * Remove item
   *
   * @param {*} item
   */
  const deleteItemAction = (item) => {
    const param = convertObjectToUrlParams({
      id: item.user_Id,
      phamMem_Id: INFO.phanMem_Id,
      donVi_Id: INFO.donVi_Id,
    });
    let url = `Account/delete-all-role-user-cbnv?${param}`;
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
    let check = true;
    JSON.parse(item.chiTietRoles).forEach((r) => {
      if (r.roleName.toUpperCase().includes("ADMINISTRATOR")) {
        check = false;
      }
    });
    const editItem =
      permission && permission.edit && check ? (
        <Link
          to={{
            pathname: `${match.path}/${item.user_Id}/chinh-sua`,
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
      permission && permission.del && check
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
        if (item.roleName.trim() === "Quản trị") color = "magenta";
        return (
          <Tag key={index} color={color}>
            {item.roleName}
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
        dataIndex: "chiTietRoles",
        key: "chiTietRoles",
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
        dataIndex: "fullName",
        align: "center",
        key: "fullName",
        filters: removeDuplicates(
          map(dataList, (d) => {
            return {
              text: d.fullName,
              value: d.fullName,
            };
          })
        ),
        filterSearch: true,
        onFilter: (value, record) => record.fullName.includes(value),
      },
      { title: "Email", dataIndex: "email", key: "email", align: "center" },
    ];
    if (permission && permission.edit) {
      renderHead = [
        ...renderHead,
        {
          title: "Trạng thái",
          key: "IsActive_Role",
          dataIndex: "IsActive_Role",
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
        title="Người dùng"
        description="Danh sách người dùng"
        buttons={addButtonRender()}
      />
      <Card className="th-card-margin-bottom">
        <Row>
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
              marginLeft: 10,
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
        </Row>
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

export default NguoiDung;
