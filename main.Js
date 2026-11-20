
"use strict";

// =====================================
// 1. Student Class
// =====================================

class Student {
    #grades;
    #attendance;

    constructor(id, name, grades, attendance) {
        this.id = id;
        this.name = name;
        this.grades = grades;
        this.attendance = attendance;
    }

    set grades(value) {
        if (!Array.isArray(value) || value.length !== 3) {
            throw new Error("يجب إدخال درجات المواد الثلاث.");
        }

        if (value.some(grade =>
            !Number.isFinite(grade) || grade < 0 || grade > 100
        )) {
            throw new Error("الدرجات يجب أن تكون بين 0 و100.");
        }

        this.#grades = [...value];
    }

    get grades() {
        return [...this.#grades];
    }

    set attendance(value) {
        if (!Number.isFinite(value) || value < 0 || value > 100) {
            throw new Error("نسبة الحضور يجب أن تكون بين 0 و100.");
        }

        this.#attendance = value;
    }

    get attendance() {
        return this.#attendance;
    }

    calculateAverage() {
        return this.#grades.reduce(
            (sum, grade) => sum + grade, 0
        ) / 3;
    }

    getGradeLetter() {
        const average = this.calculateAverage();

        if (average >= 90) return "A";
        else if (average >= 80) return "B";
        else if (average >= 70) return "C";
        else if (average >= 60) return "D";
        else if (average >= 50) return "E";
        else return "F";
    }

    getResult() {
        return this.calculateAverage() >= 50 &&
            this.#attendance >= 75
            ? "ناجح"
            : "راسب";
    }
}


// =====================================
// 2. Main Application
// =====================================

document.addEventListener("DOMContentLoaded", function () {

    // HTML Elements

    const studentName = document.getElementById("studentName");

    const grade1 = document.getElementById("grade1");
    const grade2 = document.getElementById("grade2");
    const grade3 = document.getElementById("grade3");

    const attendance = document.getElementById("attendance");

    const addStudentButton = document.getElementById("addStudent");
    const graceCommitteeButton = document.getElementById("graceCommittee");

    const studentsList = document.getElementById("studentsList");

    const errorMessage = document.getElementById("errorMessage");
    const successMessage = document.getElementById("successMessage");

    const finalReport = document.getElementById("finalReport");

    const totalStudentsElement = document.getElementById("totalStudents");
    const passedStudentsElement = document.getElementById("passedStudents");
    const failedStudentsElement = document.getElementById("failedStudents");
    const classAverageElement = document.getElementById("classAverage");

    const studentSearch = document.getElementById("studentSearch");
    const studentFilter = document.getElementById("studentFilter");

    const themeToggle = document.getElementById("themeToggle");

    // Students Data

    let studentsListArray = [];
    let nextId = 1;


    // =====================================
    // 3. Messages
    // =====================================

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = "block";

        successMessage.textContent = "";
        successMessage.style.display = "none";
    }

    function showSuccess(message) {
        successMessage.textContent = message;
        successMessage.style.display = "block";

        errorMessage.textContent = "";
        errorMessage.style.display = "none";
    }

    function clearMessages() {
        errorMessage.textContent = "";
        errorMessage.style.display = "none";

        successMessage.textContent = "";
        successMessage.style.display = "none";
    }


    // =====================================
    // 4. Escape HTML
    // =====================================

    function escapeHTML(value) {
        return String(value).replace(/[&<>"']/g, character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[character]);
    }


    // =====================================
    // 5. Save Students
    // =====================================

    function saveStudents() {
        const data = studentsListArray.map(student => ({
            id: student.id,
            name: student.name,
            grades: student.grades,
            attendance: student.attendance
        }));

        localStorage.setItem("students", JSON.stringify(data));
    }


    // =====================================
    // 6. Dashboard Statistics
    // =====================================

    function updateStatistics() {
        const total = studentsListArray.length;

        const passed = studentsListArray.filter(
            student => student.getResult() === "ناجح"
        ).length;

        const failed = total - passed;

        const average = total > 0
            ? studentsListArray.reduce(
                (sum, student) => sum + student.calculateAverage(), 0
            ) / total
            : 0;

        totalStudentsElement.textContent = total;
        passedStudentsElement.textContent = passed;
        failedStudentsElement.textContent = failed;
        classAverageElement.textContent = average.toFixed(1) + "%";
    }


    // =====================================
    // 7. Display Students
    // =====================================

    function displayStudents() {
        studentsList.innerHTML = "";

        const searchValue = studentSearch.value.trim().toLowerCase();
        const filterValue = studentFilter.value;

        const filteredStudents = studentsListArray.filter(student => {
            const matchesName =
                student.name.toLowerCase().includes(searchValue);

            const result = student.getResult();

            const matchesFilter =
                filterValue === "all" ||
                (filterValue === "passed" && result === "ناجح") ||
                (filterValue === "failed" && result === "راسب");

            return matchesName && matchesFilter;
        });

        if (filteredStudents.length === 0) {
            const message = document.createElement("p");

            message.className = "empty-message";

            message.textContent = studentsListArray.length === 0
                ? "لم تتم إضافة أي طالب حتى الآن."
                : "لا توجد نتائج مطابقة للبحث.";

            studentsList.appendChild(message);
            return;
        }

        filteredStudents.forEach(student => {
            const average = student.calculateAverage();
            const result = student.getResult();

            const studentCard = document.createElement("div");
            studentCard.className = "student-card";

            const title = document.createElement("h5");
            title.textContent = student.name;

            const gradesText = document.createElement("p");
            gradesText.textContent =
                `الدرجات: ${student.grades.join(" - ")}`;

            const averageText = document.createElement("p");
            averageText.textContent =
                `المتوسط: ${average.toFixed(2)}%`;

            const letterText = document.createElement("p");
            letterText.textContent =
                `التقدير: ${student.getGradeLetter()}`;

            const attendanceText = document.createElement("p");
            attendanceText.textContent =
                `الحضور: ${student.attendance}%`;

            const resultText = document.createElement("p");
            resultText.textContent = `النتيجة: ${result}`;

            resultText.style.color =
                result === "ناجح" ? "#20c997" : "#ff6577";

            resultText.style.fontWeight = "bold";


            // ---------------------------------
            // Edit Student Button
            // ---------------------------------

            const editButton = document.createElement("button");

            editButton.type = "button";
            editButton.className = "btn btn-primary btn-sm me-2";

            editButton.innerHTML =
                '<i class="bi bi-pencil-square"></i> تعديل';

            editButton.addEventListener("click", function () {
                const newName = prompt(
                    "أدخل اسم الطالب:",
                    student.name
                );

                if (newName === null) return;

                if (newName.trim() === "") {
                    showError("اسم الطالب لا يمكن أن يكون فارغًا.");
                    return;
                }

                const newGrade1 = prompt(
                    "درجة المادة الأولى:",
                    student.grades[0]
                );

                if (newGrade1 === null) return;

                const newGrade2 = prompt(
                    "درجة المادة الثانية:",
                    student.grades[1]
                );

                if (newGrade2 === null) return;

                const newGrade3 = prompt(
                    "درجة المادة الثالثة:",
                    student.grades[2]
                );

                if (newGrade3 === null) return;

                const newAttendance = prompt(
                    "نسبة الحضور:",
                    student.attendance
                );

                if (newAttendance === null) return;

                try {
                    const values = [
                        newGrade1.trim(),
                        newGrade2.trim(),
                        newGrade3.trim(),
                        newAttendance.trim()
                    ];

                    if (values.some(value => value === "")) {
                        throw new Error("يجب ملء جميع الدرجات والحضور.");
                    }

                    const updatedStudent = new Student(
                        student.id,
                        newName.trim(),
                        [
                            Number(newGrade1),
                            Number(newGrade2),
                            Number(newGrade3)
                        ],
                        Number(newAttendance)
                    );

                    const index = studentsListArray.findIndex(
                        item => item.id === student.id
                    );

                    if (index === -1) {
                        throw new Error("لم يتم العثور على الطالب.");
                    }

                    studentsListArray[index] = updatedStudent;

                    saveStudents();
                    displayStudents();
                    updateStatistics();

                    showSuccess("تم تعديل بيانات الطالب بنجاح.");

                } catch (error) {
                    showError(error.message);
                }
            });


            // ---------------------------------
            // Delete Student Button
            // ---------------------------------

            const deleteButton = document.createElement("button");

            deleteButton.type = "button";
            deleteButton.className = "btn btn-danger btn-sm";

            deleteButton.innerHTML =
                '<i class="bi bi-trash"></i> حذف';

            deleteButton.addEventListener("click", function () {
                const confirmed = confirm(
                    `هل أنت متأكد من حذف الطالب ${student.name}؟`
                );

                if (!confirmed) return;

                studentsListArray = studentsListArray.filter(
                    item => item.id !== student.id
                );

                saveStudents();
                displayStudents();
                updateStatistics();

                showSuccess("تم حذف الطالب بنجاح.");
            });


            // Add Elements to Card

            studentCard.append(
                title,
                gradesText,
                averageText,
                letterText,
                attendanceText,
                resultText,
                editButton,
                deleteButton
            );

            studentsList.appendChild(studentCard);
        });
    }


    // =====================================
    // 8. Load Students
    // =====================================

    function loadStudents() {
        try {
            const savedStudents = JSON.parse(
                localStorage.getItem("students") || "[]"
            );

            if (!Array.isArray(savedStudents)) {
                throw new Error("بيانات الطلاب المحفوظة غير صحيحة.");
            }

            studentsListArray = savedStudents.map(student => {
                return new Student(
                    student.id,
                    student.name,
                    student.grades,
                    student.attendance
                );
            });

            nextId = studentsListArray.reduce(
                (max, student) => Math.max(max, student.id),
                0
            ) + 1;

            displayStudents();
            updateStatistics();

        } catch (error) {
            studentsListArray = [];

            showError("تعذر تحميل بيانات الطلاب: " + error.message);

            displayStudents();
            updateStatistics();
        }
    }


    // =====================================
    // 9. Add Student
    // =====================================

    addStudentButton.addEventListener("click", function () {
        clearMessages();

        try {
            const name = studentName.value.trim();

            if (name === "") {
                throw new Error("من فضلك أدخل اسم الطالب.");
            }

            if (
                grade1.value.trim() === "" ||
                grade2.value.trim() === "" ||
                grade3.value.trim() === ""
            ) {
                throw new Error("من فضلك أدخل درجات المواد الثلاث.");
            }

            if (attendance.value.trim() === "") {
                throw new Error("من فضلك أدخل نسبة الحضور.");
            }

            const grades = [
                Number(grade1.value),
                Number(grade2.value),
                Number(grade3.value)
            ];

            const attendanceValue = Number(attendance.value);

            const student = new Student(
                nextId,
                name,
                grades,
                attendanceValue
            );

            studentsListArray.push(student);
            nextId++;

            saveStudents();
            displayStudents();
            updateStatistics();

            studentName.value = "";
            grade1.value = "";
            grade2.value = "";
            grade3.value = "";
            attendance.value = "";

            showSuccess("تمت إضافة الطالب بنجاح.");

        } catch (error) {
            showError(error.message);
        }
    });


    // =====================================
    // 10. Search and Filter
    // =====================================

    studentSearch.addEventListener("input", displayStudents);
    studentFilter.addEventListener("change", displayStudents);


    // =====================================
    // 11. Theme Toggle
    // =====================================

    function setTheme(theme) {
        document.body.classList.toggle(
            "light-theme",
            theme === "light"
        );

        themeToggle.innerHTML = theme === "light"
            ? '<i class="bi bi-moon-fill"></i>'
            : '<i class="bi bi-sun-fill"></i>';

        localStorage.setItem("theme", theme);
    }

    const savedTheme = localStorage.getItem("theme") || "dark";

    setTheme(savedTheme);

    themeToggle.addEventListener("click", function () {
        const isLight =
            document.body.classList.contains("light-theme");

        setTheme(isLight ? "dark" : "light");
    });


    // =====================================
    // 12. Grace Committee
    // =====================================

    graceCommitteeButton.addEventListener("click", function () {
        clearMessages();

        // FILTER: Students with averages from 40 to 49

        const eligibleStudents = studentsListArray.filter(student => {
            const average = student.calculateAverage();

            return average >= 40 && average <= 49;
        });


        // MAP: Add 5 to the average only

        const updatedStudents = eligibleStudents.map(student => {
            const oldAverage = student.calculateAverage();

            return {
                name: student.name,
                grades: student.grades,
                oldAverage: oldAverage,
                newAverage: oldAverage + 5
            };
        });


        // REDUCE: Calculate total after grace

        const totalAfterGrace = updatedStudents.reduce(
            (sum, student) => sum + student.newAverage,
            0
        );

        const generalAverage = updatedStudents.length > 0
            ? totalAfterGrace / updatedStudents.length
            : 0;


        // FINAL REPORT

        const studentsNames = updatedStudents.length > 0
            ? updatedStudents.map(student => {
                const gradesBefore = student.grades.join(" - ");

                return `
                    <div class="grace-student">

                        <strong>
                            ${escapeHTML(student.name)}
                        </strong>

                        <span>
                            الدرجات قبل الرأفة:
                            ${gradesBefore}
                        </span>

                        <span>
                            الدرجات بعد الرأفة:
                            ${gradesBefore}
                            <small>
                                (درجات المواد الأصلية لا تتغير)
                            </small>
                        </span>

                        <span>
                            المتوسط قبل الرأفة:
                            ${student.oldAverage.toFixed(2)}%
                        </span>

                        <span>
                            المتوسط بعد الرأفة:
                            ${student.newAverage.toFixed(2)}%
                        </span>

                    </div>
                `;
            }).join("")
            : `
                <p class="empty-message">
                    لا يوجد طلاب متوسطهم بين 40 و49.
                </p>
            `;

        finalReport.innerHTML = `
            <div class="grace-report">

                <h4>تقرير لجنة الرأفة</h4>

                <p>
                    عدد الطلاب المستحقين:
                    <strong>${updatedStudents.length}</strong>
                </p>

                <div class="grace-students-list">
                    ${studentsNames}
                </div>

                <p class="fw-bold">
                    متوسط الطلاب بعد الرأفة:
                    ${generalAverage.toFixed(2)}%
                </p>

            </div>
        `;

        showSuccess(
            `تم تشغيل لجنة الرأفة بنجاح. عدد الطلاب المستحقين: ${updatedStudents.length}`
        );
    });


    // =====================================
    // 13. Start Application
    // =====================================

    loadStudents();

});
