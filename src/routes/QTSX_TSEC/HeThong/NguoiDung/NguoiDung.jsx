import React, { useState, useEffect } from "react";
import { Card, Button, Tag, Divider, Row, Col, Modal as AntModal } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  UnlockOutlined,
  LockOutlined,
  DeleteOutlined,
  ImportOutlined,
  SyncOutlined,
  ExclamationCircleOutlined,
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
import Helpers from "src/helpers";

const { confirm } = AntModal;

function NguoiDung({ match, history, permission }) {
  const dispatch = useDispatch();
  const INFO = getLocalStorage("menu");
  const { loading, width } = useSelector(({ common }) => common).toJS();
  const [Data, setData] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [IsAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (permission && permission.view) {
      getIsAdmin();
      getListData(keyword, INFO);
    } else if ((permission && !permission.view) || permission === undefined) {
      history.push("/home");
    }
    return () => {
      dispatch(fetchReset());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permission]);

  const getListData = (keyword, INFO) => {
    let param = convertObjectToUrlParams({
      keyword,
      phanMem_id: INFO.phanMem_Id,
      donVi_Id: INFO.donVi_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `PhanMem/user-all-role?${param}`,
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
          setData(res.data);
        } else {
          setData([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getIsAdmin = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_BaoCao/is-admin?donViHienHanh_Id=${INFO.donVi_Id}`,
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

  const handleRedirect = () => {
    history.push(`${match.path}/them-moi`);
  };

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

  const deleteItemFunc = (item) => {
    const title = "người dùng";
    ModalDeleteConfirm(deleteItemAction, item, item.fullName, title);
  };

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

  const handleResetPassword = (id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `Account/ResetPassword/${id}`,
          "PUT",
          null,
          "",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res && res.status !== 409) {
          getListData(keyword, INFO);
          Helpers.alertSuccessMessage(res.data);
        }
      })
      .catch((error) => console.error(error));
  };

  const ModalResetMatKhau = (id) => {
    confirm({
      icon: <ExclamationCircleOutlined />,
      content: "Xác nhận reset mật khẩu!",
      okText: "Xác nhận",
      cancelText: "Hủy",
      onOk() {
        handleResetPassword(id);
      },
    });
  };

  const actionContent = (item) => {
    const editItem =
      permission && permission.edit ? (
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
      permission && permission.del
        ? { onClick: () => deleteItemFunc(item) }
        : { disabled: true };

    const resetPassword = { onClick: () => ModalResetMatKhau(item.user_Id) };

    return (
      <React.Fragment>
        <a {...resetPassword} disabled={!IsAdmin} title="Reset mật khẩu">
          <SyncOutlined />
        </a>
        <Divider type="vertical" />
        {editItem}
        <Divider type="vertical" />
        <a {...deleteItemVal} title="Xóa">
          <DeleteOutlined />
        </a>
      </React.Fragment>
    );
  };

  const onSearchNguoiDung = () => {
    getListData(keyword, INFO);
  };

  const onChangeKeyword = (val) => {
    setKeyword(val.target.value);
    if (isEmpty(val.target.value)) {
      getListData(val.target.value, INFO);
    }
  };

  const renderDisplayName = (val) => {
    if (!isEmpty(val)) {
      return map(val, (item, index) => {
        let color = "blue";
        if (item.roleName.trim() === "Quản trị") color = "magenta";
        return (
          <Tag
            key={index}
            color={color}
            style={{
              margin: index + 1 !== val.length ? "0px 5px 5px 0px" : "",
              fontSize: "13px",
            }}
          >
            {item.roleName}
          </Tag>
        );
      });
    }
    return null;
  };

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
        width: 300,
      },
      {
        title: "Mã nhân viên",
        dataIndex: "maNhanVien",
        key: "maNhanVien",
        width: 120,
        align: "center",
        filters: removeDuplicates(
          map(Data, (d) => {
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
        width: 150,
        filters: removeDuplicates(
          map(Data, (d) => {
            return {
              text: d.fullName,
              value: d.fullName,
            };
          })
        ),
        filterSearch: true,
        onFilter: (value, record) => record.fullName.includes(value),
      },
      {
        title: "Email",
        dataIndex: "email",
        key: "email",
        align: "center",
        width: 180,
      },
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
      {
        title: "Chức năng",
        key: "action",
        align: "center",
        width: 120,
        render: (value) => actionContent(value),
        fixed: width > 700 && "left",
      },
      ...renderHead,
    ];
    return renderHead;
  };

  const handleImportNguoiDung = () => {
    history.push(`${match.path}/import`);
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
          Thêm người dùng
        </Button>
        <Button
          icon={<ImportOutlined />}
          className="th-margin-bottom-0"
          type="primary"
          onClick={handleImportNguoiDung}
          disabled={permission && !permission.add}
        >
          Import người dùng
        </Button>
      </>
    );
  };

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
          scroll={{ x: 1200, y: "53vh" }}
          columns={header()}
          className="gx-table-responsive"
          dataSource={reDataForTable(Data)}
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
