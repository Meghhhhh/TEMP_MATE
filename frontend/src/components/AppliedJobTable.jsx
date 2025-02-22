import React from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Badge } from "./ui/badge";
import { useSelector } from "react-redux";

const AppliedJobTable = () => {
  const { allAppliedJobs } = useSelector((store) => store.job);
  return (
    <div className="rounded-2xl shadow-lg border border-white/20 bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-xl transition-all hover:shadow-xl py-5">
      <Table className="w-full bg-transparent">
        <TableHeader className="bg-transparent">
          <TableRow className="bg-transparent">
            <TableHead className="bg-transparent text-white font-bold">
              Date
            </TableHead>
            <TableHead className="bg-transparent text-white font-bold">
              Job Role
            </TableHead>
            <TableHead className="bg-transparent text-white font-bold">
              Company
            </TableHead>
            <TableHead className="bg-transparent text-white font-bold text-right">
              Status
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="bg-transparent">
          {allAppliedJobs.length <= 0 ? (
            <span>You haven't applied any job yet.</span>
          ) : (
            allAppliedJobs.map((appliedJob) => (
              <TableRow key={appliedJob._id} className="bg-transparent">
                <TableCell className="bg-transparent">
                  {appliedJob?.createdAt?.split("T")[0]}
                </TableCell>
                <TableCell className="bg-transparent">
                  {appliedJob.job?.title}
                </TableCell>
                <TableCell className="bg-transparent">
                  {appliedJob.job?.company?.name}
                </TableCell>
                <TableCell className="bg-transparent text-right">
                  <Badge
                    className={`${
                      appliedJob?.status === "rejected"
                        ? "bg-red-400"
                        : appliedJob.status === "pending"
                        ? "bg-gray-400"
                        : "bg-green-400"
                    }`}
                  >
                    {appliedJob.status.toUpperCase()}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default AppliedJobTable;
