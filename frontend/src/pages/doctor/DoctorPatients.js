import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Phone, Mail, Calendar, FileText } from 'lucide-react';

const DoctorPatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await axios.get('/api/appointments');
      const appointments = response.data.data;
      
      // Extract unique patients
      const uniquePatients = appointments.reduce((acc, appointment) => {
        const patientId = appointment.patientId._id;
        if (!acc.find(p => p._id === patientId)) {
          acc.push({
            ...appointment.patientId,
            lastVisit: appointment.appointmentDate,
            totalVisits: appointments.filter(a => a.patientId._id === patientId).length,
            status: appointment.status
          });
        }
        return acc;
      }, []);
      
      setPatients(uniquePatients);
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Patients</h1>
        <p className="text-gray-600">View and manage your patient records</p>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {patients.map((patient) => (
            <li key={patient._id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <User className="h-10 w-10 text-gray-400 bg-gray-100 rounded-full p-2" />
                    <div className="ml-4">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-gray-900">{patient.name}</p>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-1" />
                          {patient.email}
                        </div>
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-1" />
                          {patient.phone}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-900">
                      {patient.totalVisits} visit{patient.totalVisits !== 1 ? 's' : ''}
                    </p>
                    <p className="text-sm text-gray-500">
                      Last: {new Date(patient.lastVisit).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DoctorPatients;