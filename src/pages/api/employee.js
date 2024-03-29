import dbConnect from "@/db/dbConnect";
import Employee from "@/db/Employees";
import moment from "moment-timezone";
dbConnect();

function sendError(res, statusCode, message) {
  res.status(statusCode).json({
    error: true,
    message: message,
  });
}

function isEmployeePermanent(joiningDate) {
  // Existing logic to check if permanent
  const joinDate = new Date(joiningDate);
  const probationEndDate = new Date(
    joinDate.getFullYear(),
    joinDate.getMonth() + 6,
    joinDate.getDate(),
  );
  const today = new Date();
  const isPermanent = today >= probationEndDate;

  // Calculate remaining time if not permanent
  if (!isPermanent) {
    const remainingDays = Math.floor(
      (probationEndDate - today) / (1000 * 60 * 60 * 24),
    );
    return {
      isPermanent: false,
      remainingTimeInDays: remainingDays, // Return raw days
    };
  }

  // Calculate job age/service time if permanent
  const jobAgeInDays = Math.floor((today - joinDate) / (1000 * 60 * 60 * 24));
  return {
    isPermanent: true,
    jobAgeInDays: jobAgeInDays, // Return raw days
  };
}

async function handleGetAllEmployeeByFilter(req, res) {
  try {
    const { generalsearchstring, blood_group, servicetime } = req.headers;

    let query = {};
    if (blood_group) query.blood_group = blood_group;

    let matchStage = {};

    if (servicetime) {
      const [year, month, date] = moment()
        .utc()
        .format("YYYY-MM-DD")
        .split("-");

      switch (servicetime) {
        case "lessThan1Year":
          matchStage = {
            joining_date: { $gt: `${year - 1}-${month}-${date}` },
          };
          break;
        case "atLeast1Year":
          matchStage = {
            joining_date: { $lte: `${year - 1}-${month}-${date}` },
          };
          break;
        case "atLeast2Years":
          matchStage = {
            joining_date: { $lte: `${year - 2}-${month}-${date}` },
          };
          break;
        case "atLeast3Years":
          matchStage = {
            joining_date: { $lte: `${year - 3}-${month}-${date}` },
          };
          break;
        case "moreThan3Years":
          matchStage = {
            joining_date: { $lt: `${year - 3}-${month}-${date}` },
          };
          break;
        default:
          console.warn(`Invalid service time option: ${servicetime}`);
          break;
      }
    }

    let searchQuery = { ...query, ...matchStage };

    if (!query && !generalsearchstring) {
      sendError(res, 400, "No filter applied");
    } else {
      if (generalsearchstring) {
        searchQuery = {
          $or: [
            { e_id: { $regex: generalsearchstring, $options: "i" } },
            {
              company_provided_name: {
                $regex: generalsearchstring,
                $options: "i",
              },
            },
            { department: { $regex: generalsearchstring, $options: "i" } },
            { designation: { $regex: generalsearchstring, $options: "i" } },
            { email: { $regex: generalsearchstring, $options: "i" } },
            { nid: { $regex: generalsearchstring, $options: "i" } },
            { real_name: { $regex: generalsearchstring, $options: "i" } },
          ],
        };
      }

      let employees = await Employee.find(searchQuery).sort({ e_id: 1 }).exec();

      const processedEmployees = employees.map((employee) => {
        const permanentInfo = isEmployeePermanent(employee.joining_date);
        let priority = 0;

        switch (true) {
          case employee.status === "Active":
            priority = 1;
            break;
          case employee.status === "Inactive":
            priority = 2;
            break;
          case employee.status === "Fired":
            priority = 3;
            break;
          case employee.status === "Resigned":
            priority = 4;
            break;
        }

        return {
          ...employee.toObject(),
          permanentInfo,
          priority,
        };
      });
      const sortedEmployees = processedEmployees.sort(
        (a, b) => a.priority - b.priority,
      );
      if (sortedEmployees) {
        res.status(200).json(sortedEmployees);
      } else sendError(res, 400, "Unable to retrieve employees list");
    }
  } catch (e) {
    console.error(e);
    sendError(res, 500, "An error occurred");
  }
}

async function handleGetAllEmployees(req, res) {
  try {
    let query = {};
    let employees = await Employee.find(query).sort({ e_id: 1 }).exec();
    const processedEmployees = employees.map((employee) => {
      const permanentInfo = isEmployeePermanent(employee.joining_date);
      let priority = 0;

      switch (true) {
        case employee.status === "Active":
          priority = 1;
          break;
        case employee.status === "Inactive":
          priority = 2;
          break;
        case employee.status === "Fired":
          priority = 3;
          break;
        case employee.status === "Resigned":
          priority = 4;
          break;
      }

      return {
        ...employee.toObject(),
        permanentInfo,
        priority,
      };
    });
    const sortedEmployees = processedEmployees.sort(
      (a, b) => a.priority - b.priority,
    );
    if (sortedEmployees) {
      res.status(200).json(sortedEmployees);
    } else sendError(res, 400, "Unable to retrieve employees list");
  } catch (e) {
    console.error(e);
    sendError(res, 500, "An error occurred");
  }
}

async function handleNewEmployee(req, res) {
  try {
    let data = req.body;

    if (!data) sendError(res, 400, "No data provided");

    if (data.pf_start_date) {
      let pfStartDate = moment(data.pf_start_date, "YYYY-MM-DD");
      const currentDate = moment().format("YYYY-MM-DD");

      if (pfStartDate.isAfter(currentDate)) {
        sendError(res, 400, "PF Start Date must be befere today's date");
      }
    }

    let newUser = await Employee.findOneAndUpdate({ e_id: data.e_id }, data, {
      new: true,
      upsert: true,
    });

    if (newUser) {
      res.status(200).json(newUser);
    } else sendError(res, 400, "Unable to create employee");
  } catch (e) {
    console.error(e);
    sendError(res, 500, "An error occurred");
  }
}

function getMonthsTillNow(dateString) {
  const dateParts = dateString.split("-");
  const givenYear = parseInt(dateParts[0]);
  const givenMonth = parseInt(dateParts[1]) - 1;

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const totalYears = currentYear - givenYear;
  const totalMonths = totalYears * 12 + (currentMonth - givenMonth);

  console.log(totalMonths);

  return totalMonths;
}

function calculateSalaryComponents(grossSalary) {
  const basePercentage = 68;
  const base = Math.floor((grossSalary * basePercentage) / 100);
  const houseRent = Math.floor(
    (grossSalary * (100 - basePercentage)) / 100 / 2,
  );
  const convAllowance = Math.floor(
    (grossSalary * (100 - basePercentage)) / 100 / 2,
  );

  // const calculatedTotal = base + houseRent + convAllowance;
  // const difference = grossSalary - calculatedTotal;
  // const adjustedBase = base + difference;

  return [base, houseRent, convAllowance, grossSalary];
}

async function handleEditEmployee(req, res) {
  const data = req.body;

  try {
    const originalEmployee = await Employee.findById(data._id);

    const resData = await Employee.findByIdAndUpdate(data._id, data, {
      new: true,
    });

    if (originalEmployee) {
      const isGrossSalaryUpdated =
        resData.gross_salary !== originalEmployee.gross_salary;
      const isProvidentFundUpdated =
        resData.provident_fund !== originalEmployee.provident_fund;

      if (isGrossSalaryUpdated || isProvidentFundUpdated) {
        let totalSavedAmount = 0;

        if (originalEmployee.pf_history && originalEmployee.pf_history.length) {
          totalSavedAmount =
            originalEmployee.pf_history[originalEmployee.pf_history.length - 1]
              .saved_amount;
          const prevDate =
            originalEmployee.pf_history[originalEmployee.pf_history.length - 1]
              .date;

          const salaryComponents = calculateSalaryComponents(
            originalEmployee.gross_salary,
          );
          const newAmount = Math.round(
            salaryComponents[0] *
              (originalEmployee.provident_fund / 100 || 0) *
              getMonthsTillNow(prevDate),
          );

          totalSavedAmount += newAmount;
        } else {
          const salaryComponents = calculateSalaryComponents(
            originalEmployee.gross_salary,
          );
          const startDate = originalEmployee.pf_start_date;
          const newAmount = Math.round(
            salaryComponents[0] *
              (originalEmployee.provident_fund / 100 || 0) *
              getMonthsTillNow(startDate),
          );
          totalSavedAmount = newAmount;
        }

        resData.pf_history.push({
          date: moment().utc().format("YYYY-MM-DD"),
          gross: originalEmployee.gross_salary || 0,
          provident_fund: originalEmployee.provident_fund || 0,
          saved_amount: totalSavedAmount || 0,
          note: isProvidentFundUpdated
            ? "Provident fund percentage was updated."
            : "Gross salary was updated.",
        });

        await resData.save();
      }

      res.status(200).json(resData);
    } else {
      sendError(res, 400, "No employee found");
    }
  } catch (e) {
    console.error(e);
    sendError(res, 500, "An error occurred");
  }
}

async function handleGetEmployeeById(req, res) {
  try {
    let data = req.headers;
    const resData = await Employee.findById(data.id).lean();

    if (!resData) sendError(res, 400, "No employee data found with the id");
    else res.status(200).json(resData);
  } catch (e) {
    console.error(e);
    sendError(res, 500, "An error occurred");
  }
}

async function handleGetEmployeeByCode(req, res) {
  try {
    let data = req.headers;

    const employee = await Employee.findOne({
      e_id: data.e_id,
    }).lean();

    if (!employee) sendError(res, 400, "No employee found with the code");
    else res.status(200).json(employee);
  } catch (e) {
    console.error(e);
    sendError(res, 500, "An error occurred");
  }
}

async function handleGetMarkerNameByRealName(req, res) {
  try {
    let data = req.headers;
    const employee = await Employee.findOne({
      real_name: data.real_name,
    })
      .collation({ locale: "en", alternate: "shifted" })
      .lean();

    if (!employee) sendError(res, 400, "No employee found with the name");
    else res.status(200).json(employee);
  } catch (e) {
    console.error(e);
    sendError(res, 500, "An error occurred");
  }
}

export default async function handle(req, res) {
  const { method } = req;

  switch (method) {
    case "GET":
      if (req.headers.getallemployees) {
        await handleGetAllEmployees(req, res);
      } else if (req.headers.getemployeebyid) {
        await handleGetEmployeeById(req, res);
      } else if (req.headers.getemployeebycode) {
        await handleGetEmployeeByCode(req, res);
      } else if (req.headers.getmarkernamebyrealname) {
        await handleGetMarkerNameByRealName(req, res);
      } else if (req.headers.getallemployeebyfilter) {
        await handleGetAllEmployeeByFilter(req, res);
      }
      break;

    case "POST":
      if (req.headers.newemployee) {
        await handleNewEmployee(req, res);
      } else if (req.headers.editemployee) {
        await handleEditEmployee(req, res);
      }

      break;

    default:
      sendError(res, 400, "Unknown request");
  }
}
