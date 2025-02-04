import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { createJobApplication } from "@/lib/services/api/jobApplications";
import { getJobById } from "@/lib/services/api/jobs";
import { Job } from "@/types/job";
import { useUser } from "@clerk/clerk-react";
import { Briefcase, MapPin } from "lucide-react";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function JobPage() {
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isLoaded, isSignedIn } = useUser();
  const navigate = useNavigate();

  const { id } = useParams();
  console.log(id); //Gives us the value of the route param.

  const [formData, setFormData] = useState({
    fullName: "",
    a1: "",
    a2: "",
    a3: "",
  });

  // useEffect(() => {

  //   const fetchJob = async () => {
  //     const res = await fetch(`http://localhost:8000/jobs/${id}`, {
  //       method: "GET",
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });
  //     const data: Job = await res.json();
  //     return data;
  //   };
  //   fetchJob().then((data) => {
  //     setJob(data);
  //     setIsLoading(false);
  //   });
  // }, [id]);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (!isSignedIn) {
      return navigate("/sign-in");
    }

    if (!id) return;
    getJobById(id).then((data) => {
      setJob(data);
      setIsLoading(false);
    });
  }, [id, isLoaded, isSignedIn, navigate]);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
    if (!id) return;

    await createJobApplication({
      userId: user.id,
      fullName: formData.fullName,
      job: id,
      answers: [formData.a1, formData.a2, formData.a3],
    });

    // console.log(formData);
    // const res = await fetch("http://localhost:8000/jobApplications", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({
    //     userId: user.user?.id,
    //     job: id,
    //     fullName: formData.fullName,
    //     answers: [formData.a1, formData.a2, formData.a3],
    //   }),
    // });
    // console.log(res);
  };

  if (isLoading || job === null) {
    return (
      <div>
        <h2>Loading....</h2>
      </div>
    );
  }

  return (
    <div className="text-white">
      <div>
        <h2 className="text-2xl font-bold ">{job.title}</h2>
        <div className="flex items-center gap-x-4 mt-4">
          <div className="flex items-center gap-x-2">
            <Briefcase />
            <span>{job.type}</span>
          </div>
          <div className="flex items-center gap-x-2">
            <MapPin />
            <span>{job.location}</span>
          </div>
        </div>
      </div>
      <div className="mt-4 py-4">
        <p>{job.description}</p>
      </div>
      <Separator />
      <form className="py-8" onSubmit={handleSubmit}>
        <div>
          <h3>Full Name</h3>
          <Input
            className="text-black mt-2"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
          />
        </div>
        {job.questions.map((question, i) => {
          return (
            <div key={i} className="mt-4">
              <h3>{question}</h3>
              <Textarea
                className="text-black mt-2"
                name={`a${i + 1}`}
                required
                onChange={handleChange}
              />
            </div>
          );
        })}
        <Button
          type="submit"
          className="mt-8 bg-[yellow] hover:bg-[#c6c63e] text-card-foreground"
        >
          Submit
        </Button>
      </form>
    </div>
  );
}

export default JobPage;
