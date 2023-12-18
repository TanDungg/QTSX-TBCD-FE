import { SaveOutlined } from "@ant-design/icons";
import React, { useState, useEffect } from "react";
import { Card, Row, Col, Button } from "antd";

import { useDispatch } from "react-redux";

import { Select, Tree } from "src/components/Common";
import { fetchStart, fetchReset } from "src/appRedux/actions/Common";
import {
  convertObjectToUrlParams,
  getLocalStorage,
  getTokenInfo,
} from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";

function PhanQuyenKho({ permission, history }) {
  const dispatch = useDispatch();
  const [UserSelect, setUserSelect] = useState();
  const [disableTree, setDisableTree] = useState(false);
  const [treeData, setTreeData] = useState();
  const [donViRole, setDonViRole] = useState([]);
  const [expandedKeys, setExpandedKeys] = useState([]);
  const [user, setUser] = useState("");
  const INFO = { ...getLocalStorage("menu"), user_Id: getTokenInfo().id };

  useEffect(() => {
    if (permission && permission.view) {
      getUser(INFO);
    } else if ((permission && !permission.view) || permission === undefined) {
      history.push("/home");
    }
    return () => {
      dispatch(fetchReset());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getUser = (info) => {
    let param = convertObjectToUrlParams({ donviId: info.donVi_Id, key: 1 });

    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `Account/get-cbnv?${param}`,
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
        setUserSelect(
          res.data.map((d) => {
            return {
              name: `${d.maNhanVien} - ${d.fullName} - ${d.email}`,
              ...d,
            };
          })
        );
      } else {
        setUserSelect([]);
      }
    });
  };
  /**
   * Load danh sách người dùng
   * @param keyword Từ khóa
   * @param page Trang
   * @param pageSize
   */
  const getListData = (id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `CauTrucKho/get-list-kho-vat-tu-thanh-pham`,
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
        setTreeData(
          res.data.map((k) => {
            return {
              ...k,
              name: k.tenCTKho + " - " + k.tenPhongBan,
            };
          })
        );
      }
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `RoleByDonVi/${id}`,
          "GET",
          null,
          "DETAIL",
          "",
          resolve,
          reject
        )
      );
    }).then((res) => {
      if (res && res.data.length > 0 && res.data[0].lstrole.length > 0) {
        const newData = [];
        const expanded = [];
        res.data[0].lstrole.forEach((d) => {
          const exp = d.ghepNoiIds.split("_");
          if (exp.length === 2) {
            if (!expanded.includes(exp[0])) {
              expanded.push(exp[0]);
            }
          } else if (exp.length === 3) {
            if (!expanded.includes(exp[0])) {
              expanded.push(exp[0]);
            }
            if (!expanded.includes(exp[0] + "_" + exp[1])) {
              expanded.push(exp[0] + "_" + exp[1]);
            }
          } else if (exp.length === 4) {
            if (!expanded.includes(exp[0])) {
              expanded.push(exp[0]);
            }
            if (!expanded.includes(exp[0] + "_" + exp[1])) {
              expanded.push(exp[0] + "_" + exp[1]);
            }
            if (!expanded.includes(exp[0] + "_" + exp[1] + "_" + exp[2])) {
              expanded.push(exp[0] + "_" + exp[1] + "_" + exp[2]);
            }
          }
          newData.push(d.ghepNoiIds);
        });
        setExpandedKeys(expanded);
        setDonViRole(newData);
      } else {
        setDonViRole(null);
      }
    });
  };
  const hanldeSelectTaiKhoan = (val) => {
    setDisableTree(true);
    setUser(val);
    getListData(val);
  };

  const onCheck = (checkedKeysValue) => {
    setDonViRole(checkedKeysValue);
  };
  const onExpand = (expandedKeysValue) => {
    setExpandedKeys(expandedKeysValue);
  };

  const handleSave = () => {
    console.log(donViRole);
    // const newData = {
    //   user_Id: user,
    //   lstrole: donViRole.map((d) => {
    //     const result = d.split("_");
    //     if (result.length === 1) {
    //       return {
    //         tapDoan_Id: result[0],
    //       };
    //     } else if (result.length === 2) {
    //       return {
    //         tapDoan_Id: result[0],
    //         donVi_Id: result[1],
    //       };
    //     } else if (result.length === 3) {
    //       return {
    //         tapDoan_Id: result[0],
    //         donVi_Id: result[1],
    //         phongban_Id: result[2],
    //       };
    //     } else if (result.length === 4) {
    //       return {
    //         tapDoan_Id: result[0],
    //         donVi_Id: result[1],
    //         phongban_Id: result[2],
    //         boPhan_Id: result[3],
    //       };
    //     } else {
    //       return undefined;
    //     }
    //   }),
    // };
    // new Promise((resolve, reject) => {
    //   dispatch(
    //     fetchStart(`RoleByDonVi`, "POST", newData, "EDIT", "", resolve, reject)
    //   );
    // })
    //   .then((res) => {
    //     getListData(user);
    //   })
    //   .catch((err) => console.log(err));
  };

  const addButtonRender = () => {
    return (
      <>
        <Button
          icon={<SaveOutlined />}
          className="th-btn-margin-bottom-0"
          type="primary"
          onClick={handleSave}
          disabled={
            (permission && !permission.add) || user === "" || !donViRole
          }
        >
          Lưu
        </Button>
      </>
    );
  };

  return (
    <div className="gx-main-content">
      <ContainerHeader
        title="Phân quyền kho"
        description="Phân quyền kho"
        buttons={addButtonRender()}
      />
      <Card className="th-card-margin-bottom th-card-reset-margin">
        <Row>
          <Col
            xxl={2}
            xl={3}
            lg={4}
            md={4}
            sm={5}
            xs={7}
            align={"center"}
            style={{ marginTop: 8 }}
          >
            <h5>Tài khoản: </h5>
          </Col>
          <Col
            xxl={19}
            xl={19}
            lg={19}
            md={19}
            sm={19}
            xs={16}
            style={{ marginBottom: 8 }}
          >
            <Select
              className="heading-select slt-search th-select-heading"
              data={UserSelect ? UserSelect : []}
              placeholder="Tìm tài khoản"
              optionsvalue={["id", "name"]}
              style={{ width: "100%" }}
              optionFilterProp={"name"}
              showSearch
              onSelect={hanldeSelectTaiKhoan}
            />
          </Col>
        </Row>
      </Card>
      {disableTree && (
        <Card className="th-card-margin-bottom th-card-reset-margin">
          <Tree
            checkable
            treeData={treeData}
            // autoExpandParent={true}
            options={["id", "name", "children"]}
            onCheck={onCheck}
            onExpand={onExpand}
            height={"60vh"}
            expandedKeys={expandedKeys}
            checkedKeys={donViRole}
            selectable={false}
          />
        </Card>
      )}
    </div>
  );
}
export default PhanQuyenKho;
