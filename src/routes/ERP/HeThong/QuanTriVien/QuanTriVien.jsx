import React, { useState, useEffect } from "react";
import { Card, Button, Tag, Avatar, Image, Divider } from "antd";
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
  reDataForTable,
  removeDuplicates,
} from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";

function QuanTriVien({ history, permission }) {
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const dispatch = useDispatch();
  const { data, loading, width } = useSelector(({ common }) => common).toJS();
  useEffect(() => {
    if (permission && permission.view) {
      getListData(keyword, page);
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
  const getListData = (keyword, page) => {
    let param = convertObjectToUrlParams({ page, keyword });
    dispatch(
      fetchStart(
        `Account/list-user-administrator?${param}`,
        "GET",
        null,
        "LIST"
      )
    );
  };

  /**
   * handleTableChange
   *
   * Fetch dữ liệu dựa theo thay đổi trang
   * @param {number} pagination
   */
  const handleTableChange = (pagination) => {
    setPage(pagination);
    getListData(keyword, pagination);
  };

  /**
   * Chuyển tới trang thêm mới người dùng
   *
   */
  const handleRedirect = () => {
    history.push("/he-thong-erp/quan-tri-vien/them-moi");
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
      user_Id: record.id,
      role_Id: record.role_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `PhanMem/active-phan-mem-for-user?${param}`,
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
          getListData(keyword, page);
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
    const title = "Quản trị viên";
    ModalDeleteConfirm(deleteItemAction, item, item.fullName, title);
  };

  /**
   * Remove item
   *
   * @param {*} item
   */
  const deleteItemAction = (item) => {
    const param = convertObjectToUrlParams({
      id: item.id,
      role_Id: item.role_Id,
    });
    let url = `Account/user-administrator?${param}`;
    new Promise((resolve, reject) => {
      dispatch(fetchStart(url, "DELETE", null, "DELETE", "", resolve, reject));
    })
      .then((res) => {
        if (res.status !== 409) {
          getListData(keyword, page);
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
            pathname: `/he-thong-erp/quan-tri-vien/${item.id}_${item.role_Id}/chinh-sua`,
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
    getListData(keyword, page);
  };

  /**
   * Thay đổi keyword
   *
   * @param {*} val
   */
  const onChangeKeyword = (val) => {
    setKeyword(val.target.value);
    if (isEmpty(val.target.value)) {
      getListData(val.target.value, page);
    }
  };

  const renderPhanMem = (val) => {
    return (
      <span>
        {val.tenPhanMem +
          " - " +
          val.maTapDoan +
          (val.maDonVi ? " - " + val.maDonVi : "") +
          (val.maPhongBan ? " - " + val.maPhongBan : "")}
      </span>
    );
  };
  const renderImage = (val) => {
    if (isEmpty(val) || val === null) {
      return <Avatar size={50} src={require("assets/images/no-image.png")} />;
    }
    return (
      <Image
        style={{
          width: 50,
          height: 50,
          objectFit: "fill",
          borderRadius: "70%",
        }}
        preview={{ src: `${val}` }}
        src={`${val}`}
      />
    );
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
        title: "Phần mềm",
        dataIndex: "phanMem",
        key: "phanMem",
        align: "center",
        render: (val, record) => renderPhanMem(record),
      },
      {
        title: "Quyền",
        dataIndex: "roleName",
        key: "roleName",
        align: "center",
        render: (val) => renderDisplayName(val),
      },
      // {
      //   title: "Avatar",
      //   dataIndex: "hinhAnhUrl",
      //   key: "hinhAnhUrl",
      //   align: "center",
      //   render: (val, record) => renderImage(val, record),
      // },

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
          key: "isActive_Role",
          dataIndex: "isActive_Role",
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

  /**
   * Hiển thị tag quyền
   *
   * @param {*} val
   * @returns
   */
  const renderDisplayName = (val) => {
    if (!isEmpty(val)) {
      let color = "green";
      return (
        <Tag key={val} color={color}>
          {val}
        </Tag>
      );
    }
    return null;
  };

  /**
   * Hiển thị button thêm
   *
   * @returns
   */
  const handleClearSearch = () => {
    getListData(null, 1);
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
        Thêm quản trị viên
      </Button>
    );
  };

  const { totalPages, totalRow, pageSize } = data;
  const dataList = reDataForTable(
    data.datalist,
    page === 1 ? page : pageSize * (page - 1) + 2
  );
  return (
    <div className="gx-main-content">
      <ContainerHeader
        title="Quản trị viên"
        description="Danh sách quản trị viên"
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
            onClear: { handleClearSearch },
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
            onChange: handleTableChange,
            pageSize: pageSize,
            total: totalRow,
            showSizeChanger: false,
            showQuickJumper: true,
            showTotal: (total) =>
              totalRow <= total
                ? `Hiển thị ${data.datalist.length} trong tổng ${totalRow}`
                : `Tổng ${totalPages}`,
          }}
          loading={loading}
        />
      </Card>
    </div>
  );
}

export default QuanTriVien;
