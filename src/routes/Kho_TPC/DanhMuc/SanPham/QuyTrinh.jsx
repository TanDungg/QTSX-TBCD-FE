import React, { useState, useEffect } from "react";
import { Card, Row, Col } from "antd";
import { repeat, map, filter, forEach, isEmpty, find } from "lodash";
import { useDispatch, useSelector } from "react-redux";

import { CheckBox, Table } from "src/components/Common";
import { fetchStart, fetchReset } from "src/appRedux/actions/Common";
import {
  reDataSelectedTable,
  newTreeToFlatlist,
  fillTreeWithValue,
  reDataForTable,
} from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";

function QuyTrinh({ history, permission, location, match }) {
  const dispatch = useDispatch();
  const { loading } = useSelector(({ common }) => common).toJS();
  const [id, setId] = useState(undefined);
  const [listPermission, setListPermission] = useState([]);
  const [listPermissionFlat, setListPermissionFlat] = useState([]);
  const [listChiTiet, setListChiTiet] = useState([]);
  const [listQuyTrinh, setListQuyTrinh] = useState([]);
  const [name, setName] = useState("");
  useEffect(() => {
    const load = () => {
      if (permission && !permission.view) {
        history.push("/home");
      } else {
        const { id } = match.params;
        getQuyTrinh();
        const itemData = location.state ? location.state.itemData : {};
        // eslint-disable-next-line react-hooks/exhaustive-deps
        id && getChiTiet(id);
        if (itemData) {
          const { id, description } = itemData;
          setId(id);
        } else {
          setId(id);
        }
      }
    };
    load();
    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const getChiTiet = (id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_ChiTiet/chi-tiet-quy-trinh?sanPham_Id=${id}`,
          "GET",
          null,
          "LIST",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res && res.data) {
          setName(res.data.tenSanPham);
          setListChiTiet(JSON.parse(res.data.chiTiet));
        }
      })
      .catch((err) => console.error(err));
  };
  const getQuyTrinh = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(`lkn_QuyTrinhSX`, "GET", null, "LIST", "", resolve, reject)
      );
    })
      .then((res) => {
        if (res && res.data) {
          setListQuyTrinh(res.data);
        }
      })
      .catch((err) => console.error(err));
  };
  const header = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      align: "center",
      width: 45,
    },
    {
      title: "Tên chi tiết",
      dataIndex: "tenChiTiet",
      key: "tenChiTiet",
      align: "center",
    },
    ...listQuyTrinh.map((qt, index) => {
      return {
        title: qt.tenQuyTrinhSX,
        dataIndex: "quyTrinh",
        key: `quyTrinh${index}`,
        align: "center",
        render: (value, record) =>
          renderPermissionTmp(value, record, qt.tenQuyTrinhSX),
      };
    }),
  ];

  /**
   * Hiển thị checkbox trên bảng
   *
   * @param {*} value
   * @param {*} record
   * @param {*} keyName
   * @returns
   */
  const renderPermissionTmp = (value, record, keyName) => {
    let check = false;
    let qt_Id = "";
    value.forEach((qt) => {
      if (qt.tenQuyTrinhSX === keyName) {
        check = qt.checkqt;
        qt_Id = qt.lkn_QuyTrinh_Id;
      }
    });
    return (
      <Row>
        <Col xs={24}>
          <CheckBox
            checked={check}
            name={String(record.id)}
            onChange={(e) => handleCheck(e, qt_Id, record.chiTiet_Id)}
            value={{ data: record, keyName }}
          />
        </Col>
      </Row>
    );
  };

  /**
   * Hành động check trên bảng
   *
   * @param {*} e
   * @memberof Quyen
   */
  const handleCheck = async (e, qt_Id, chiTiet_Id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_ChiTiet/add-chi-tiet-quy-trinh`,
          "POST",
          {
            lkn_ChiTiet_Id: chiTiet_Id,
            lkn_QuyTrinhSX_Id: qt_Id,
          },
          "EDITQUYTRINH",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res && res.status !== 409) {
          getChiTiet(id);
        }
      })
      .catch((err) => console.error(err));
  };

  /**
   * Về trang vai trò
   *
   */
  const redirectToVaiTro = () => {
    history.push(`${match.url.replace(`/${id}/quy-trinh`, "")}`);
  };

  /**
   * Thiết lập lại giá trị ở menu cha view = true nếu có bất kỳ permission bên dưới và ngược lại
   *
   * @param {*} newValues
   * @param {*} parent_Id parent_Id
   * @param {*} status true or false
   */
  const reCheckParentValue = (newValues, parent_Ids, status) => {
    return map(newValues, (item) => {
      forEach(parent_Ids, (parent_Id) => {
        if (item.id === parent_Id) {
          item.permission.view = status;
        } else {
          if (!isEmpty(item.children)) {
            reCheckParentValue(item.children, parent_Ids, status);
          }
        }
      });
      return item;
    });
  };

  let flatData = reDataForTable(listChiTiet);
  const titleCard = `Quy trình sản phẩm ${name}`;
  return (
    <div className="gx-main-content">
      <ContainerHeader
        title={titleCard}
        description="Chi tiết phân quyền"
        back={redirectToVaiTro}
      />
      <Card className="th-card-margin-bottom">
        <Table
          bordered
          size="small"
          scroll={{ y: "65vh", x: 700 }}
          columns={header}
          className="gx-table-responsive"
          dataSource={flatData}
          pagination={false}
          rowClassName={(record) => {
            return record.isParent ? "th-table-row-background" : "";
          }}
          loading={loading}
        />
      </Card>
    </div>
  );
}

export default QuyTrinh;
